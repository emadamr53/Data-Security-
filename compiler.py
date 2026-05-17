"""
Do-While Loop Compiler — All 5 Phases
======================================
Phase 1: Context Free Grammar (CFG)
Phase 2: Lexical Analyzer
Phase 3: Syntax Analyzer (Recursive Descent / LL(1) Parser → AST in JSON)
Phase 4: Semantic Analyzer (Annotated AST, Symbol Table, type checking)
Phase 5: Optimized Intermediate Code Generation (TAC + Constant Folding + Dead Code Elim)

No external parsing libraries used. Pure Python (stdlib only).
Supports full C program structure: #include, main(), return 0;
"""

import json
import sys
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, font as tkfont


# ===========================================================================
# PHASE 1: CONTEXT FREE GRAMMAR (CFG)
# ===========================================================================

CFG = """\
===================================================
  CONTEXT FREE GRAMMAR (CFG) — Do-While Loop
  Technique: LL(1) / Recursive Descent Parsing
===================================================

Terminals:
  int float char bool          → type keywords
  do while if else             → control-flow keywords
  true false                   → boolean literals
  return                       → return keyword
  ID   [a-zA-Z_][a-zA-Z0-9_]* → identifier
  NUM  [0-9]+                  → integer literal
  FLOAT_NUM [0-9]+.[0-9]+      → float literal
  CHAR_LIT  'x'               → character literal
  + - * / %                   → arithmetic operators
  == != < > <= >=             → relational operators
  && || !                     → logical operators
  = ; ( ) { }                 → punctuation
  // ...                      → line comment (stripped by lexer)

Productions:
  program         → directives main_function | directives stmt_list
  directives      → directive directives | ε
  directive       → include_directive | using_directive
  include_directive → HASH INCLUDE LT ID GT
                    | HASH INCLUDE STR_LIT
  using_directive → USING NAMESPACE ID(std) SEMI
  main_function   → int main ( ) { stmt_list return_stmt }
  return_stmt     → return expr ; | return NUM ;
  stmt_list       → stmt stmt_list | ε
  stmt            → decl_stmt | assign_stmt | do_while_stmt | if_stmt
                  | cout_stmt | cin_stmt | expr_stmt
  decl_stmt       → type ID = expr ; | type ID ;
  assign_stmt     → ID = expr ;
  expr_stmt       → expr ;
  do_while_stmt   → do { stmt_list } while ( condition ) ;
  if_stmt         → if ( condition ) { stmt_list }
                  | if ( condition ) { stmt_list } else { stmt_list }
  type            → int | float | char | bool
  condition       → expr rel_op expr | expr log_op expr
                  | ! condition | ( condition ) | true | false
  rel_op          → == | != | < | > | <= | >=
  log_op          → && | ||
  expr            → term expr'            [left-recursion eliminated]
  expr'           → + term expr' | - term expr' | ε
  term            → factor term'          [left-recursion eliminated]
  term'           → * factor term' | / factor term' | % factor term' | ε
  factor          → ( expr ) | NUM | FLOAT_NUM | CHAR_LIT | STR_LIT | ID
                  | - factor | true | false
  cout_stmt       → cout << output_item ( << output_item )* ;
  cin_stmt        → cin >> ID ( >> ID )* ;
  output_item     → expr | STR_LIT | endl

LL(1) Parse Table (Partial):
  Non-Terminal   | do            | if/else       | int|float|.. | ID           | } / EOF
  ───────────────┼───────────────┼───────────────┼──────────────┼──────────────┼────────
  stmt           | do_while_stmt | if_stmt       | decl_stmt    | assign/expr  | ε
  stmt_list      | → stmt sl     | → stmt sl     | → stmt sl    | → stmt sl    | → ε
  do_while_stmt  | do{..}while() | —             | —            | —            | —
  expr           | —             | —             | → term expr' | → term expr' | —
  factor         | —             | —             | → NUM/FLOAT  | → ID         | —

Key Design Decisions:
  • Left recursion eliminated: expr/term use iterative while-loops (LL(1) compliant)
  • Operator precedence encoded: factor → term → expr layers enforce * binds tighter than +
  • do-while semantics: body appears before condition → guaranteed first execution
  • Full C program structure supported: #include directives + int main() wrapper
"""


# ===========================================================================
# PHASE 2: LEXICAL ANALYZER
# ===========================================================================

TT_INT      = 'INT'
TT_FLOAT    = 'FLOAT'
TT_CHAR     = 'CHAR'
TT_BOOL     = 'BOOL'
TT_DO       = 'DO'
TT_WHILE    = 'WHILE'
TT_IF       = 'IF'
TT_ELSE     = 'ELSE'
TT_RETURN   = 'RETURN'
TT_TRUE     = 'TRUE'
TT_FALSE    = 'FALSE'
TT_MAIN     = 'MAIN'
TT_ID       = 'ID'
TT_NUM      = 'NUM'
TT_FNUM     = 'FLOAT_NUM'
TT_CHARLIT  = 'CHAR_LIT'
TT_PLUS     = 'PLUS'
TT_MINUS    = 'MINUS'
TT_MUL      = 'MUL'
TT_DIV      = 'DIV'
TT_MOD      = 'MOD'
TT_EQ       = 'EQ'
TT_NEQ      = 'NEQ'
TT_LT       = 'LT'
TT_GT       = 'GT'
TT_LTE      = 'LTE'
TT_GTE      = 'GTE'
TT_AND      = 'AND'
TT_OR       = 'OR'
TT_NOT      = 'NOT'
TT_ASSIGN   = 'ASSIGN'
TT_SEMI     = 'SEMI'
TT_LPAREN   = 'LPAREN'
TT_RPAREN   = 'RPAREN'
TT_LBRACE   = 'LBRACE'
TT_RBRACE   = 'RBRACE'
TT_LSHIFT   = 'LSHIFT'
TT_RSHIFT   = 'RSHIFT'
TT_COUT     = 'COUT'
TT_CIN      = 'CIN'
TT_ENDL     = 'ENDL'
TT_STR_LIT  = 'STR_LIT'
TT_HASH      = 'HASH'
TT_INCLUDE   = 'INCLUDE'
TT_USING     = 'USING'
TT_NAMESPACE = 'NAMESPACE'
TT_EOF      = 'EOF'

KNOWN_LIBRARIES = {
    'iostream', 'stdio.h', 'stdlib.h', 'string.h',
    'math.h', 'cmath', 'cstdio', 'cstdlib', 'cstring',
    'iomanip', 'fstream', 'sstream', 'vector', 'algorithm',
}

KEYWORDS = {
    'int':       TT_INT,
    'float':     TT_FLOAT,
    'char':      TT_CHAR,
    'bool':      TT_BOOL,
    'do':        TT_DO,
    'while':     TT_WHILE,
    'if':        TT_IF,
    'else':      TT_ELSE,
    'return':    TT_RETURN,
    'true':      TT_TRUE,
    'false':     TT_FALSE,
    'main':      TT_MAIN,
    'cout':      TT_COUT,
    'cin':       TT_CIN,
    'endl':      TT_ENDL,
    'include':   TT_INCLUDE,
    'using':     TT_USING,
    'namespace': TT_NAMESPACE,
}


class Token:
    def __init__(self, type_, value, line=0, col=0):
        self.type  = type_
        self.value = value
        self.line  = line
        self.col   = col

    def __repr__(self):
        return f'Token({self.type}, {repr(self.value)}, line={self.line}, col={self.col})'


class LexerError(Exception):
    pass


class Lexer:
    def __init__(self, source):
        self.source = source
        self.pos    = 0
        self.line   = 1
        self.col    = 1
        self.tokens = []

    def error(self, msg):
        raise LexerError(f"[Lexer Error] Line {self.line}, Col {self.col}: {msg}")

    def peek(self, offset=0):
        idx = self.pos + offset
        return self.source[idx] if idx < len(self.source) else None

    def advance(self):
        ch = self.source[self.pos]
        self.pos += 1
        if ch == '\n':
            self.line += 1
            self.col = 1
        else:
            self.col += 1
        return ch

    def skip_whitespace(self):
        while self.pos < len(self.source) and self.source[self.pos] in ' \t\r\n':
            self.advance()

    def skip_line_comment(self):
        while self.pos < len(self.source) and self.source[self.pos] != '\n':
            self.advance()

    def read_header_name(self):
        self.skip_spaces_on_line()
        if self.pos >= len(self.source):
            self.error("#include missing header name")

        ch = self.source[self.pos]
        tokens_out = []

        if ch == '<':
            lt_line, lt_col = self.line, self.col
            self.advance()
            tokens_out.append(Token(TT_LT, '<', lt_line, lt_col))

            lib = ''
            lib_line, lib_col = self.line, self.col
            while self.pos < len(self.source) and self.source[self.pos] not in ('>', '\n'):
                lib += self.advance()
            lib = lib.strip()

            if not lib:
                self.error(f"Line {lt_line}: #include angle-bracket header is empty: <>")

            if self.pos >= len(self.source) or self.source[self.pos] == '\n':
                self.error(f"Line {lt_line}: #include <{lib}> is missing closing '>'")

            gt_line, gt_col = self.line, self.col
            self.advance()
            tokens_out.append(Token(TT_ID,  lib, lib_line, lib_col))
            tokens_out.append(Token(TT_GT,  '>',  gt_line,  gt_col))

            if lib not in KNOWN_LIBRARIES:
                self.error(
                    f"Line {lt_line}: Unknown library '<{lib}>'. "
                    f"Known libraries: {', '.join(sorted(KNOWN_LIBRARIES))}"
                )
            return tokens_out

        elif ch == '"':
            str_line, str_col = self.line, self.col
            self.advance()
            lib = ''
            while self.pos < len(self.source) and self.source[self.pos] not in ('"', '\n'):
                lib += self.advance()
            if self.pos >= len(self.source) or self.source[self.pos] == '\n':
                self.error(f"Line {str_line}: #include \"{lib}\" is missing closing '\"'")
            self.advance()
            if not lib:
                self.error(f"Line {str_line}: #include quoted header is empty")
            tokens_out.append(Token(TT_STR_LIT, lib, str_line, str_col))
            return tokens_out
        else:
            self.error(
                f"Line {self.line}, Col {self.col}: #include must be followed by "
                f"<library> or \"file\", got '{ch}'"
            )

    def skip_spaces_on_line(self):
        while self.pos < len(self.source) and self.source[self.pos] in ' \t':
            self.advance()

    def lex_include_directive(self):
        hash_line, hash_col = self.line, self.col
        self.advance()
        result = [Token(TT_HASH, '#', hash_line, hash_col)]

        self.skip_spaces_on_line()

        if not (self.pos < len(self.source) and
                self.source[self.pos:self.pos+7] == 'include' and
                (self.pos+7 >= len(self.source) or
                 not self.source[self.pos+7].isalnum())):
            word = ''
            while self.pos < len(self.source) and (self.source[self.pos].isalnum() or self.source[self.pos] == '_'):
                word += self.advance()
            self.error(
                f"Line {hash_line}: Unknown preprocessor directive '#{word}'. "
                f"Only '#include' is supported."
            )

        inc_line, inc_col = self.line, self.col
        for _ in range(7):
            self.advance()
        result.append(Token(TT_INCLUDE, 'include', inc_line, inc_col))

        self.skip_spaces_on_line()
        header_tokens = self.read_header_name()
        result.extend(header_tokens)

        self.skip_spaces_on_line()
        if self.pos < len(self.source) and self.source[self.pos] not in ('\n', '/'):
            bad = ''
            while self.pos < len(self.source) and self.source[self.pos] != '\n':
                bad += self.advance()
            self.error(
                f"Line {hash_line}: Unexpected content after #include header: '{bad.strip()}'"
            )
        return result

    def lex_using_directive(self):
        result = []
        using_line, using_col = self.line, self.col

        for _ in range(5):
            self.advance()
        result.append(Token(TT_USING, 'using', using_line, using_col))

        self.skip_spaces_on_line()

        if not (self.pos < len(self.source) and
                self.source[self.pos:self.pos+9] == 'namespace' and
                (self.pos+9 >= len(self.source) or
                 not self.source[self.pos+9].isalnum())):
            word = ''
            while self.pos < len(self.source) and (self.source[self.pos].isalnum() or self.source[self.pos] == '_'):
                word += self.advance()
            self.error(
                f"Line {using_line}: Expected 'namespace' after 'using', got '{word}'. "
                f"Did you mean 'using namespace std;'?"
            )

        ns_line, ns_col = self.line, self.col
        for _ in range(9):
            self.advance()
        result.append(Token(TT_NAMESPACE, 'namespace', ns_line, ns_col))

        self.skip_spaces_on_line()

        if self.pos >= len(self.source) or not (self.source[self.pos].isalpha() or self.source[self.pos] == '_'):
            self.error(
                f"Line {using_line}: Expected namespace name after 'using namespace', "
                f"got '{self.source[self.pos] if self.pos < len(self.source) else 'EOF'}'"
            )

        name_line, name_col = self.line, self.col
        name = ''
        while self.pos < len(self.source) and (self.source[self.pos].isalnum() or self.source[self.pos] == '_'):
            name += self.advance()

        if name != 'std':
            self.error(
                f"Line {using_line}: Unknown namespace '{name}'. "
                f"Only 'std' is supported (using namespace std;)"
            )
        result.append(Token(TT_ID, name, name_line, name_col))

        self.skip_spaces_on_line()

        if self.pos >= len(self.source) or self.source[self.pos] != ';':
            got = self.source[self.pos] if self.pos < len(self.source) else 'EOF'
            self.error(
                f"Line {using_line}: Expected ';' at end of 'using namespace {name}', "
                f"got '{got}'"
            )
        semi_line, semi_col = self.line, self.col
        self.advance()
        result.append(Token(TT_SEMI, ';', semi_line, semi_col))

        return result

    def read_number(self):
        start_line, start_col = self.line, self.col
        num = ''
        while self.pos < len(self.source) and self.source[self.pos].isdigit():
            num += self.advance()
        if self.pos < len(self.source) and self.source[self.pos] == '.':
            num += self.advance()
            while self.pos < len(self.source) and self.source[self.pos].isdigit():
                num += self.advance()
            return Token(TT_FNUM, float(num), start_line, start_col)
        return Token(TT_NUM, int(num), start_line, start_col)

    def read_identifier(self):
        start_line, start_col = self.line, self.col
        ident = ''
        while self.pos < len(self.source) and (self.source[self.pos].isalnum() or self.source[self.pos] == '_'):
            ident += self.advance()
        tt = KEYWORDS.get(ident, TT_ID)
        return Token(tt, ident, start_line, start_col)

    def read_char_literal(self):
        start_line, start_col = self.line, self.col
        self.advance()
        if self.pos >= len(self.source):
            self.error("Unterminated character literal")
        ch = self.advance()
        if self.pos >= len(self.source) or self.source[self.pos] != "'":
            self.error("Character literal must contain exactly one character")
        self.advance()
        return Token(TT_CHARLIT, ch, start_line, start_col)

    def read_string_literal(self):
        start_line, start_col = self.line, self.col
        self.advance()
        s = ''
        while self.pos < len(self.source) and self.source[self.pos] != '"':
            if self.source[self.pos] == '\\':
                self.advance()
                esc = self.advance()
                s += {'n': '\n', 't': '\t', '\\': '\\', '"': '"'}.get(esc, esc)
            else:
                s += self.advance()
        if self.pos < len(self.source):
            self.advance()
        return Token(TT_STR_LIT, s, start_line, start_col)

    def tokenize(self):
        while self.pos < len(self.source):
            self.skip_whitespace()
            if self.pos >= len(self.source):
                break

            ch = self.source[self.pos]
            line, col = self.line, self.col

            if ch == '#':
                for tok in self.lex_include_directive():
                    self.tokens.append(tok)
                continue

            if ch == 'u' and self.source[self.pos:self.pos+5] == 'using' and \
               (self.pos+5 >= len(self.source) or not self.source[self.pos+5].isalnum()):
                for tok in self.lex_using_directive():
                    self.tokens.append(tok)
                continue

            if ch == '/' and self.peek(1) == '/':
                self.skip_line_comment()
                continue

            if ch.isdigit():
                self.tokens.append(self.read_number())
                continue

            if ch.isalpha() or ch == '_':
                self.tokens.append(self.read_identifier())
                continue

            if ch == "'":
                self.tokens.append(self.read_char_literal())
                continue

            if ch == '"':
                self.tokens.append(self.read_string_literal())
                continue

            if ch == '<' and self.peek(1) == '<':
                self.advance(); self.advance()
                self.tokens.append(Token(TT_LSHIFT, '<<', line, col)); continue

            if ch == '>' and self.peek(1) == '>':
                self.advance(); self.advance()
                self.tokens.append(Token(TT_RSHIFT, '>>', line, col)); continue

            if ch == '=' and self.peek(1) == '=':
                self.advance(); self.advance()
                self.tokens.append(Token(TT_EQ,  '==', line, col)); continue
            if ch == '!' and self.peek(1) == '=':
                self.advance(); self.advance()
                self.tokens.append(Token(TT_NEQ, '!=', line, col)); continue
            if ch == '<' and self.peek(1) == '=':
                self.advance(); self.advance()
                self.tokens.append(Token(TT_LTE, '<=', line, col)); continue
            if ch == '>' and self.peek(1) == '=':
                self.advance(); self.advance()
                self.tokens.append(Token(TT_GTE, '>=', line, col)); continue
            if ch == '&' and self.peek(1) == '&':
                self.advance(); self.advance()
                self.tokens.append(Token(TT_AND, '&&', line, col)); continue
            if ch == '|' and self.peek(1) == '|':
                self.advance(); self.advance()
                self.tokens.append(Token(TT_OR,  '||', line, col)); continue

            single = {
                '+': TT_PLUS,  '-': TT_MINUS, '*': TT_MUL,    '/': TT_DIV,
                '%': TT_MOD,   '=': TT_ASSIGN,'<': TT_LT,     '>': TT_GT,
                '!': TT_NOT,   ';': TT_SEMI,  '(': TT_LPAREN, ')': TT_RPAREN,
                '{': TT_LBRACE,'}': TT_RBRACE,
            }
            if ch in single:
                self.advance()
                self.tokens.append(Token(single[ch], ch, line, col))
                continue

            self.error(f"Unknown character: '{ch}'")

        self.tokens.append(Token(TT_EOF, None, self.line, self.col))
        return self.tokens


# ===========================================================================
# PHASE 3: SYNTAX ANALYZER — Recursive Descent (LL(1) Parser) → AST
# ===========================================================================

class ParseError(Exception):
    pass


class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos    = 0

    def current(self):
        return self.tokens[self.pos]

    def peek(self, offset=1):
        idx = self.pos + offset
        return self.tokens[idx] if idx < len(self.tokens) else self.tokens[-1]

    def consume(self, expected_type=None):
        tok = self.tokens[self.pos]
        if expected_type and tok.type != expected_type:
            raise ParseError(
                f"[Syntax Error] Line {tok.line}, Col {tok.col}: "
                f"Expected '{expected_type}', got '{tok.type}' ('{tok.value}')"
            )
        self.pos += 1
        return tok

    def parse_program(self):
        has_main = any(self.tokens[i].type == TT_MAIN for i in range(len(self.tokens)))
        if has_main:
            return self.parse_full_program()
        else:
            directives = self._collect_directives()
            stmts = self.parse_stmt_list()
            self.consume(TT_EOF)
            return {"node": "Program", "structure": "bare", "directives": directives, "body": stmts}

    def _collect_directives(self):
        directives = []
        while self.current().type in (TT_HASH, TT_USING):
            if self.current().type == TT_HASH:
                directives.append(self._parse_include_directive())
            elif self.current().type == TT_USING:
                directives.append(self._parse_using_directive())
        return directives

    def _parse_include_directive(self):
        hash_tok = self.consume(TT_HASH)
        self.consume(TT_INCLUDE)
        if self.current().type == TT_LT:
            self.consume(TT_LT)
            lib_tok = self.consume(TT_ID)
            self.consume(TT_GT)
            return {
                "node":   "Directive",
                "kind":   "include_system",
                "value":  f"#include <{lib_tok.value}>",
                "library": lib_tok.value,
                "line":   hash_tok.line,
            }
        elif self.current().type == TT_STR_LIT:
            lib_tok = self.consume(TT_STR_LIT)
            return {
                "node":   "Directive",
                "kind":   "include_local",
                "value":  f'#include "{lib_tok.value}"',
                "library": lib_tok.value,
                "line":   hash_tok.line,
            }
        else:
            raise ParseError(
                f"[Syntax Error] Line {hash_tok.line}: "
                f"#include must be followed by <library> or \"file\""
            )

    def _parse_using_directive(self):
        using_tok = self.consume(TT_USING)
        self.consume(TT_NAMESPACE)
        ns_tok = self.consume(TT_ID)
        self.consume(TT_SEMI)
        return {
            "node":      "Directive",
            "kind":      "using_namespace",
            "value":     f"using namespace {ns_tok.value};",
            "namespace": ns_tok.value,
            "line":      using_tok.line,
        }

    def parse_full_program(self):
        directives = self._collect_directives()
        self.consume(TT_INT)
        self.consume(TT_MAIN)
        self.consume(TT_LPAREN)
        self.consume(TT_RPAREN)
        self.consume(TT_LBRACE)
        stmts = self.parse_stmt_list()
        ret = None
        if self.current().type == TT_RETURN:
            ret = self.parse_return_stmt()
        self.consume(TT_RBRACE)
        self.consume(TT_EOF)
        return {
            "node":        "Program",
            "structure":   "full_c_program",
            "directives":  directives,
            "body":        stmts,
            "return_stmt": ret,
        }

    def parse_bare_program(self):
        stmts = self.parse_stmt_list()
        self.consume(TT_EOF)
        return {"node": "Program", "structure": "bare", "body": stmts}

    def parse_return_stmt(self):
        tok = self.consume(TT_RETURN)
        expr = self.parse_expr()
        self.consume(TT_SEMI)
        return {"node": "Return", "value": expr, "line": tok.line}

    def parse_stmt_list(self):
        stmts = []
        while self.current().type not in (TT_EOF, TT_RBRACE, TT_RETURN):
            stmts.append(self.parse_stmt())
        return stmts

    def parse_stmt(self):
        tok = self.current()
        if tok.type in (TT_INT, TT_FLOAT, TT_CHAR, TT_BOOL):
            return self.parse_decl_stmt()
        if tok.type == TT_DO:
            return self.parse_do_while()
        if tok.type == TT_IF:
            return self.parse_if_stmt()
        if tok.type == TT_COUT:
            return self.parse_cout_stmt()
        if tok.type == TT_CIN:
            return self.parse_cin_stmt()
        if tok.type == TT_ID:
            if self.peek(1).type == TT_ASSIGN:
                return self.parse_assign_stmt()
            return self.parse_expr_stmt()
        return self.parse_expr_stmt()

    def parse_decl_stmt(self):
        type_tok = self.consume()
        id_tok   = self.consume(TT_ID)
        node = {
            "node": "Declaration",
            "type": type_tok.value,
            "name": id_tok.value,
            "line": id_tok.line,
        }
        if self.current().type == TT_ASSIGN:
            self.consume(TT_ASSIGN)
            node["init"] = self.parse_expr()
        self.consume(TT_SEMI)
        return node

    def parse_assign_stmt(self):
        id_tok = self.consume(TT_ID)
        self.consume(TT_ASSIGN)
        expr   = self.parse_expr()
        self.consume(TT_SEMI)
        return {
            "node":  "Assignment",
            "name":  id_tok.value,
            "value": expr,
            "line":  id_tok.line,
        }

    def parse_expr_stmt(self):
        expr = self.parse_expr()
        self.consume(TT_SEMI)
        return {"node": "ExprStatement", "expr": expr}

    def parse_do_while(self):
        tok = self.consume(TT_DO)
        self.consume(TT_LBRACE)
        body = self.parse_stmt_list()
        self.consume(TT_RBRACE)
        self.consume(TT_WHILE)
        self.consume(TT_LPAREN)
        cond = self.parse_condition()
        self.consume(TT_RPAREN)
        self.consume(TT_SEMI)
        return {
            "node":      "DoWhile",
            "body":      body,
            "condition": cond,
            "line":      tok.line,
        }

    def parse_if_stmt(self):
        tok = self.consume(TT_IF)
        self.consume(TT_LPAREN)
        cond = self.parse_condition()
        self.consume(TT_RPAREN)
        self.consume(TT_LBRACE)
        then_body = self.parse_stmt_list()
        self.consume(TT_RBRACE)
        else_body = None
        if self.current().type == TT_ELSE:
            self.consume(TT_ELSE)
            self.consume(TT_LBRACE)
            else_body = self.parse_stmt_list()
            self.consume(TT_RBRACE)
        return {
            "node":      "If",
            "condition": cond,
            "then":      then_body,
            "else":      else_body,
            "line":      tok.line,
        }

    def parse_cout_stmt(self):
        tok = self.consume(TT_COUT)
        items = []
        while self.current().type == TT_LSHIFT:
            self.consume(TT_LSHIFT)
            if self.current().type == TT_ENDL:
                self.consume(TT_ENDL)
                items.append({"node": "EndlLiteral"})
            elif self.current().type == TT_STR_LIT:
                t = self.consume(TT_STR_LIT)
                items.append({"node": "StringLiteral", "value": t.value, "line": t.line})
            else:
                items.append(self.parse_expr())
        self.consume(TT_SEMI)
        return {"node": "CoutStmt", "items": items, "line": tok.line}

    def parse_cin_stmt(self):
        tok = self.consume(TT_CIN)
        targets = []
        while self.current().type == TT_RSHIFT:
            self.consume(TT_RSHIFT)
            id_tok = self.consume(TT_ID)
            targets.append({"node": "Identifier", "name": id_tok.value, "line": id_tok.line})
        self.consume(TT_SEMI)
        return {"node": "CinStmt", "targets": targets, "line": tok.line}

    def parse_condition(self):
        if self.current().type == TT_NOT:
            self.consume(TT_NOT)
            return {"node": "UnaryOp", "op": "!", "operand": self.parse_condition()}
        if self.current().type == TT_LPAREN:
            self.consume(TT_LPAREN)
            cond = self.parse_condition()
            self.consume(TT_RPAREN)
            return cond
        if self.current().type in (TT_TRUE, TT_FALSE):
            tok = self.consume()
            return {"node": "BoolLiteral", "value": tok.value}
        left = self.parse_expr()
        op_tok = self.current()
        if op_tok.type in (TT_EQ, TT_NEQ, TT_LT, TT_GT, TT_LTE, TT_GTE, TT_AND, TT_OR):
            self.consume()
            right = self.parse_expr()
            return {"node": "BinaryOp", "op": op_tok.value, "left": left, "right": right}
        return left

    def parse_expr(self):
        node = self.parse_term()
        while self.current().type in (TT_PLUS, TT_MINUS):
            op  = self.consume()
            rhs = self.parse_term()
            node = {"node": "BinaryOp", "op": op.value, "left": node, "right": rhs}
        return node

    def parse_term(self):
        node = self.parse_factor()
        while self.current().type in (TT_MUL, TT_DIV, TT_MOD):
            op  = self.consume()
            rhs = self.parse_factor()
            node = {"node": "BinaryOp", "op": op.value, "left": node, "right": rhs}
        return node

    def parse_factor(self):
        tok = self.current()
        if tok.type == TT_LPAREN:
            self.consume(TT_LPAREN)
            expr = self.parse_expr()
            self.consume(TT_RPAREN)
            return expr
        if tok.type == TT_MINUS:
            self.consume(TT_MINUS)
            operand = self.parse_factor()
            return {"node": "UnaryOp", "op": "-", "operand": operand}
        if tok.type == TT_NUM:
            self.consume()
            return {"node": "Literal", "type": "int",   "value": tok.value, "line": tok.line}
        if tok.type == TT_FNUM:
            self.consume()
            return {"node": "Literal", "type": "float", "value": tok.value, "line": tok.line}
        if tok.type == TT_CHARLIT:
            self.consume()
            return {"node": "Literal", "type": "char",  "value": tok.value, "line": tok.line}
        if tok.type == TT_STR_LIT:
            self.consume()
            return {"node": "Literal", "type": "string", "value": tok.value, "line": tok.line}
        if tok.type in (TT_TRUE, TT_FALSE):
            self.consume()
            return {"node": "Literal", "type": "bool",  "value": tok.value, "line": tok.line}
        if tok.type == TT_ID:
            self.consume()
            return {"node": "Identifier", "name": tok.value, "line": tok.line}
        raise ParseError(
            f"[Syntax Error] Line {tok.line}, Col {tok.col}: "
            f"Unexpected token '{tok.type}' ('{tok.value}') in expression"
        )


# ===========================================================================
# PHASE 4: SEMANTIC ANALYZER + ANNOTATED AST
# ===========================================================================

class SemanticError(Exception):
    pass


class SemanticAnalyzer:
    def __init__(self):
        self.symbol_table = {}
        self.errors       = []

    def error(self, msg):
        self.errors.append(f"[Semantic Error] {msg}")

    def infer_type(self, node):
        t = self._infer(node)
        node["inferred_type"] = t
        return t

    def _infer(self, node):
        n = node["node"]

        if n == "Literal":
            return node["type"]

        if n == "StringLiteral":
            return "string"

        if n == "EndlLiteral":
            return "endl"

        if n == "Identifier":
            name = node["name"]
            if name not in self.symbol_table:
                self.error(f"Line {node.get('line','?')}: Variable '{name}' is not declared.")
                return "unknown"
            if not self.symbol_table[name]["initialized"]:
                self.error(f"Line {node.get('line','?')}: Variable '{name}' is used before being initialized.")
            return self.symbol_table[name]["type"]

        if n == "BinaryOp":
            l = self.infer_type(node["left"])
            r = self.infer_type(node["right"])

            if node["op"] in ("/", "%"):
                rn = node["right"]
                if rn.get("node") == "Literal" and rn.get("value") == 0:
                    self.error(
                        f"Line {rn.get('line','?')}: Division by zero detected "
                        f"('{node['op']}' 0 is not allowed)."
                    )

            if node["op"] in ("==", "!=", "<", ">", "<=", ">=", "&&", "||"):
                if node["op"] in ("&&", "||"):
                    for side, t in [("left", l), ("right", r)]:
                        if t not in ("bool", "int", "unknown"):
                            self.error(
                                f"Line {node[side].get('line','?')}: "
                                f"Operator '{node['op']}' requires bool operands, got '{t}'."
                            )
                return "bool"

            if "unknown" in (l, r):
                return "unknown"

            if l == "string" or r == "string":
                self.error(
                    f"Arithmetic operator '{node['op']}' cannot be applied to string type."
                )
                return "unknown"

            if l == "float" or r == "float":
                if l not in ("int", "float") or r not in ("int", "float"):
                    self.error(f"Type mismatch: cannot apply '{node['op']}' to '{l}' and '{r}'.")
                return "float"

            if l == r:
                return l

            self.error(
                f"Type mismatch: cannot apply '{node['op']}' to '{l}' and '{r}'. "
                f"Use explicit casting."
            )
            return "unknown"

        if n == "UnaryOp":
            t = self.infer_type(node["operand"])
            if node["op"] == "!" and t not in ("bool", "int", "unknown"):
                self.error(f"Operator '!' requires a bool/int operand, got '{t}'.")
            if node["op"] == "-" and t not in ("int", "float", "unknown"):
                self.error(f"Unary '-' requires a numeric operand, got '{t}'.")
            return t

        if n == "BoolLiteral":
            return "bool"

        return "unknown"

    def analyze(self, ast):
        self.visit_program(ast)

    def visit_program(self, node):
        for directive in node.get("directives", []):
            directive["inferred_type"] = "directive"
        for stmt in node["body"]:
            self.visit_stmt(stmt)
        if node.get("return_stmt"):
            self.infer_type(node["return_stmt"]["value"])

    def visit_stmt(self, node):
        n = node["node"]
        if n == "Declaration":   self.visit_decl(node)
        elif n == "Assignment":  self.visit_assign(node)
        elif n == "DoWhile":     self.visit_do_while(node)
        elif n == "If":          self.visit_if(node)
        elif n == "CoutStmt":    self.visit_cout(node)
        elif n == "CinStmt":     self.visit_cin(node)
        elif n == "ExprStatement": self.infer_type(node["expr"])

    def visit_decl(self, node):
        name = node["name"]
        if name in self.symbol_table:
            self.error(f"Line {node['line']}: Variable '{name}' is already declared.")
        else:
            initialized = "init" in node
            init_value = None
            if initialized:
                init_node = node["init"]
                if init_node.get("node") == "Literal":
                    init_value = init_node.get("value")
            self.symbol_table[name] = {
                "type":          node["type"],
                "line":          node["line"],
                "initialized":   initialized,
                "initial_value": init_value,
                "scope":         "local"
            }
            if initialized:
                init_type = self.infer_type(node["init"])
                if not self.types_compatible(node["type"], init_type):
                    hint = self._type_assign_hint(node["type"], init_type)
                    self.error(
                        f"Line {node['line']}: Type error — cannot assign '{init_type}' to "
                        f"'{name}' of type '{node['type']}'. {hint}"
                    )

    def visit_assign(self, node):
        name = node["name"]
        if name not in self.symbol_table:
            self.error(f"Line {node['line']}: Variable '{name}' is not declared.")
        else:
            self.symbol_table[name]["initialized"] = True
            rhs_type = self.infer_type(node["value"])
            declared = self.symbol_table[name]["type"]
            if not self.types_compatible(declared, rhs_type):
                hint = self._type_assign_hint(declared, rhs_type)
                self.error(
                    f"Line {node['line']}: Type error — cannot assign '{rhs_type}' to "
                    f"'{name}' of type '{declared}'. {hint}"
                )

    def visit_do_while(self, node):
        for stmt in node["body"]:
            self.visit_stmt(stmt)
        cond_type = self.infer_type(node["condition"])
        if cond_type not in ("bool", "int", "unknown"):
            self.error(f"Line {node.get('line','?')}: Do-while condition must be bool/int, got '{cond_type}'.")

    def visit_if(self, node):
        cond_type = self.infer_type(node["condition"])
        if cond_type not in ("bool", "int", "unknown"):
            self.error(f"Line {node.get('line','?')}: If condition must be bool/int.")
        for stmt in node["then"]:
            self.visit_stmt(stmt)
        if node["else"]:
            for stmt in node["else"]:
                self.visit_stmt(stmt)

    def visit_cout(self, node):
        for item in node["items"]:
            if item["node"] not in ("EndlLiteral", "StringLiteral"):
                self.infer_type(item)

    def visit_cin(self, node):
        for target in node["targets"]:
            name = target["name"]
            if name not in self.symbol_table:
                self.error(f"Line {target.get('line','?')}: Variable '{name}' is not declared (cin target).")
            else:
                self.symbol_table[name]["initialized"] = True

    def types_compatible(self, declared, actual):
        if declared == actual:          return True
        if actual == "unknown":         return True
        if declared == "float" and actual == "int":  return True
        return False

    def _type_assign_hint(self, declared, actual):
        hints = {
            ("int",   "float"):  "Hint: float → int loses decimal precision. Use (int) cast or change declaration to float.",
            ("int",   "char"):   "Hint: char and int are incompatible. Declare the variable as char, or convert explicitly.",
            ("int",   "bool"):   "Hint: bool cannot be directly assigned to int without a cast.",
            ("int",   "string"): "Hint: A string cannot be stored in an int variable.",
            ("char",  "int"):    "Hint: int cannot be stored in a char variable directly.",
            ("char",  "float"):  "Hint: float cannot be stored in a char variable.",
            ("bool",  "int"):    "Hint: int cannot be assigned to bool directly.",
            ("float", "char"):   "Hint: char cannot be assigned to float.",
            ("float", "string"): "Hint: A string cannot be stored in a float variable.",
        }
        return hints.get((declared, actual), "")

    def get_symbol_table(self):
        return self.symbol_table


# ===========================================================================
# PHASE 5: TAC GENERATOR + OPTIMIZER
# ===========================================================================

class TACGenerator:
    def __init__(self):
        self.instructions = []
        self.temp_count   = 0
        self.label_count  = 0

    def new_temp(self):
        t = f"t{self.temp_count}"; self.temp_count += 1; return t

    def new_label(self):
        l = f"L{self.label_count}"; self.label_count += 1; return l

    def emit(self, instr):
        self.instructions.append(instr)

    def gen_program(self, ast):
        for directive in ast.get("directives", []):
            self.emit(f"// {directive['value']}")
        for stmt in ast["body"]:
            self.gen_stmt(stmt)
        if ast.get("return_stmt"):
            val = self.gen_expr(ast["return_stmt"]["value"])
            self.emit(f"return {val}")
        return self.instructions

    def gen_stmt(self, node):
        n = node["node"]
        if n == "Declaration":
            if "init" in node:
                val = self.gen_expr(node["init"])
                self.emit(f"{node['name']} = {val}")
        elif n == "Assignment":
            val = self.gen_expr(node["value"])
            self.emit(f"{node['name']} = {val}")
        elif n == "DoWhile":
            self.gen_do_while(node)
        elif n == "If":
            self.gen_if(node)
        elif n == "CoutStmt":
            self.gen_cout(node)
        elif n == "CinStmt":
            self.gen_cin(node)
        elif n == "ExprStatement":
            self.gen_expr(node["expr"])

    def gen_do_while(self, node):
        start_label = self.new_label()
        end_label   = self.new_label()
        self.emit(f"{start_label}:")
        for stmt in node["body"]:
            self.gen_stmt(stmt)
        cond = self.gen_expr(node["condition"])
        self.emit(f"if {cond} goto {start_label}")
        self.emit(f"{end_label}:")

    def gen_if(self, node):
        false_label = self.new_label()
        end_label   = self.new_label()
        cond = self.gen_expr(node["condition"])
        self.emit(f"if_false {cond} goto {false_label}")
        for stmt in node["then"]:
            self.gen_stmt(stmt)
        if node["else"]:
            self.emit(f"goto {end_label}")
            self.emit(f"{false_label}:")
            for stmt in node["else"]:
                self.gen_stmt(stmt)
            self.emit(f"{end_label}:")
        else:
            self.emit(f"{false_label}:")

    def gen_cout(self, node):
        for item in node["items"]:
            if item["node"] == "EndlLiteral":
                self.emit('print "\\n"')
            elif item["node"] == "StringLiteral":
                self.emit(f'print "{item["value"]}"')
            else:
                val = self.gen_expr(item)
                self.emit(f"print {val}")

    def gen_cin(self, node):
        for target in node["targets"]:
            self.emit(f"read {target['name']}")

    def gen_expr(self, node):
        n = node["node"]
        if n == "Literal":     return str(node["value"])
        if n == "Identifier":  return node["name"]
        if n == "BoolLiteral": return node["value"]
        if n == "StringLiteral": return f'"{node["value"]}"'
        if n == "EndlLiteral": return '"\\n"'
        if n == "UnaryOp":
            operand = self.gen_expr(node["operand"])
            t = self.new_temp()
            self.emit(f"{t} = {node['op']} {operand}")
            return t
        if n == "BinaryOp":
            left  = self.gen_expr(node["left"])
            right = self.gen_expr(node["right"])
            t = self.new_temp()
            self.emit(f"{t} = {left} {node['op']} {right}")
            return t
        return "?"


class Optimizer:
    BINARY_OPS = ['==', '!=', '<=', '>=', '<', '>', '+', '-', '*', '/', '%']

    def optimize(self, instructions):
        instructions = self.constant_folding(instructions)
        instructions = self.dead_code_elimination(instructions)
        return instructions

    def _is_identifier_char(self, ch):
        return ch.isalnum() or ch == '_'

    def _is_number(self, s):
        s = s.strip()
        if not s:
            return False
        start = 1 if s[0] == '-' else 0
        dot_seen = False
        for ch in s[start:]:
            if ch == '.':
                if dot_seen:
                    return False
                dot_seen = True
            elif not ch.isdigit():
                return False
        return len(s[start:]) > 0

    def _to_number(self, s):
        s = s.strip()
        if '.' in s:
            return float(s)
        return int(s)

    def _extract_tokens(self, text):
        tokens = []
        i = 0
        text = text.strip()
        while i < len(text):
            ch = text[i]
            if ch in ' \t':
                i += 1
                continue
            if ch.isalpha() or ch == '_':
                j = i
                while j < len(text) and self._is_identifier_char(text[j]):
                    j += 1
                tokens.append(text[i:j])
                i = j
            elif ch.isdigit() or (ch == '-' and i + 1 < len(text) and text[i+1].isdigit()):
                j = i + 1
                while j < len(text) and (text[j].isdigit() or text[j] == '.'):
                    j += 1
                tokens.append(text[i:j])
                i = j
            else:
                i += 1
        return tokens

    def _parse_binary_instr(self, instr):
        eq_pos = instr.find('=')
        if eq_pos <= 0:
            return None

        dest = instr[:eq_pos].strip()
        if not dest or not all(self._is_identifier_char(c) for c in dest):
            return None

        rhs = instr[eq_pos + 1:].strip()

        for op in self.BINARY_OPS:
            op_len = len(op)
            pos = 0
            while pos <= len(rhs) - op_len:
                idx = rhs.find(op, pos)
                if idx == -1:
                    break
                before = rhs[:idx].strip()
                after  = rhs[idx + op_len:].strip()
                if before and after:
                    before_clean = before.split()[-1] if ' ' in before else before
                    after_clean  = after.split()[0]  if ' ' in after  else after
                    if before_clean and after_clean:
                        return (dest, before_clean, op, after_clean)
                pos = idx + 1
        return None

    def _parse_copy_instr(self, instr):
        eq_pos = instr.find('=')
        if eq_pos <= 0:
            return None
        dest = instr[:eq_pos].strip()
        rhs  = instr[eq_pos + 1:].strip()
        if not dest or not all(self._is_identifier_char(c) for c in dest):
            return None
        if ' ' in rhs:
            return None
        has_op = any(op in rhs for op in self.BINARY_OPS)
        if has_op:
            return None
        return (dest, rhs)

    def _parse_temp_assignment(self, instr):
        eq_pos = instr.find('=')
        if eq_pos <= 0:
            return None
        dest = instr[:eq_pos].strip()
        if not dest.startswith('t'):
            return None
        if not dest[1:].isdigit():
            return None
        return dest

    def _apply_op(self, op, a, b):
        try:
            if op == '+':  return a + b
            if op == '-':  return a - b
            if op == '*':  return a * b
            if op == '/':  return (a / b) if b != 0 else None
            if op == '%':  return (a % b) if b != 0 else None
            if op == '==': return int(a == b)
            if op == '!=': return int(a != b)
            if op == '<':  return int(a <  b)
            if op == '>':  return int(a >  b)
            if op == '<=': return int(a <= b)
            if op == '>=': return int(a >= b)
        except (ZeroDivisionError, TypeError):
            return None
        return None

    def constant_folding(self, instructions):
        result    = []
        const_map = {}

        for instr in instructions:
            stripped = instr.strip()
            if (stripped.endswith(':') or
                    stripped.startswith('if ') or
                    stripped.startswith('if_false ') or
                    stripped.startswith('goto ') or
                    stripped.startswith('print ') or
                    stripped.startswith('read ') or
                    stripped.startswith('return ') or
                    stripped.startswith('//')):
                result.append(instr)
                continue

            parsed = self._parse_binary_instr(instr)
            if parsed:
                dest, a, op, b = parsed
                a_val = const_map.get(a, a)
                b_val = const_map.get(b, b)
                if self._is_number(a_val) and self._is_number(b_val):
                    try:
                        a_num = self._to_number(a_val)
                        b_num = self._to_number(b_val)
                        val   = self._apply_op(op, a_num, b_num)
                        if val is not None:
                            if isinstance(val, float) and val == int(val):
                                val = int(val)
                            const_map[dest] = str(val)
                            result.append(f"{dest} = {val}  // constant folded")
                            continue
                    except (ValueError, TypeError):
                        pass
                result.append(f"{dest} = {a_val} {op} {b_val}")
                continue

            parsed2 = self._parse_copy_instr(instr)
            if parsed2:
                dest, src = parsed2
                src_val = const_map.get(src, src)
                if self._is_number(src_val):
                    const_map[dest] = src_val
                    result.append(f"{dest} = {src_val}  // constant propagated")
                    continue

            result.append(instr)

        return result

    def dead_code_elimination(self, instructions):
        used = set()
        for instr in instructions:
            stripped = instr.strip()
            if stripped.startswith('//'):
                continue
            rhs = None
            if stripped.startswith('if_false '):
                rhs = stripped[len('if_false '):]
            elif stripped.startswith('if '):
                rhs = stripped[len('if '):]
            elif stripped.startswith('goto '):
                rhs = stripped[len('goto '):]
            elif stripped.startswith('print '):
                rhs = stripped[len('print '):]
            elif stripped.startswith('read '):
                rhs = stripped[len('read '):]
            elif stripped.startswith('return '):
                rhs = stripped[len('return '):]
            elif '=' in stripped:
                eq_pos = stripped.find('=')
                rhs = stripped[eq_pos + 1:]
            else:
                rhs = stripped

            if rhs:
                for tok in self._extract_tokens(rhs):
                    if tok and (tok[0].isalpha() or tok[0] == '_'):
                        used.add(tok)

        result = []
        for instr in instructions:
            temp = self._parse_temp_assignment(instr.strip())
            if temp and temp not in used:
                result.append(f"// [DEAD CODE ELIMINATED]: {instr.strip()}")
                continue
            result.append(instr)
        return result


# ===========================================================================
# COMPILER DRIVER
# ===========================================================================

def compile_source(source_code):
    """Run all 5 phases. Returns dict with per-phase output and success flag."""
    results = {}

    results["phase1"] = CFG

    try:
        lexer  = Lexer(source_code)
        tokens = lexer.tokenize()
    except LexerError as e:
        results["phase2"] = str(e)
        results["error"]  = str(e)
        return results

    lines = []
    lines.append(f"{'TOKEN TYPE':<25} {'VALUE':<40} {'LINE':<8} {'COL'}")
    lines.append("─" * 85)
    for tok in tokens:
        if tok.type != TT_EOF:
            val_display = str(tok.value)
            if len(val_display) > 38:
                val_display = val_display[:35] + "..."
            lines.append(f"{tok.type:<25} {val_display:<40} {tok.line:<8} {tok.col}")
    lines.append(f"\nTotal tokens: {len(tokens)-1} (excluding EOF)")
    results["phase2"] = "\n".join(lines)

    try:
        parser = Parser(tokens)
        ast    = parser.parse_program()
    except ParseError as e:
        results["phase3"] = str(e)
        results["error"]  = str(e)
        return results

    results["phase3_raw_ast"] = ast
    results["phase3"] = "Abstract Syntax Tree (JSON) — Raw (before semantic annotation):\n\n" + \
                        json.dumps(ast, indent=2)

    sem = SemanticAnalyzer()
    sem.analyze(ast)

    phase4_lines = []
    if sem.errors:
        phase4_lines.append("⚠️  Semantic errors found:\n")
        for e in sem.errors:
            phase4_lines.append(f"  {e}")
        phase4_lines.append("")
    else:
        phase4_lines.append("✅ No semantic errors found.\n")

    phase4_lines.append("Symbol Table:")
    phase4_lines.append(f"  {'NAME':<15} {'TYPE':<10} {'INITIALIZED':<14} {'INITIAL VALUE':<16} {'SCOPE':<8} {'LINE'}")
    phase4_lines.append("  " + "─"*70)
    sym = sem.get_symbol_table()
    if sym:
        for name, info in sym.items():
            iv = str(info.get('initial_value', 'N/A')) if info.get('initial_value') is not None else 'N/A'
            phase4_lines.append(
                f"  {name:<15} {info['type']:<10} {str(info['initialized']):<14} "
                f"{iv:<16} {info.get('scope','local'):<8} {info['line']}"
            )
    else:
        phase4_lines.append("  (empty)")

    phase4_lines.append("\n\nAnnotated AST (with inferred_type on every node):\n")
    phase4_lines.append(json.dumps(ast, indent=2))
    results["phase4"] = "\n".join(phase4_lines)

    if sem.errors:
        results["error"] = sem.errors[0]
        return results

    gen  = TACGenerator()
    tac  = gen.gen_program(ast)
    opt  = Optimizer()
    otac = opt.optimize(tac)

    phase5_lines = []
    phase5_lines.append("─── Raw Three Address Code (TAC) ───\n")
    for i, instr in enumerate(tac):
        phase5_lines.append(f"  {i+1:>3}.  {instr}")

    phase5_lines.append("\n─── Optimized TAC (Constant Folding + Dead Code Elimination) ───\n")
    for i, instr in enumerate(otac):
        phase5_lines.append(f"  {i+1:>3}.  {instr}")

    phase5_lines.append("\n✅ Compilation successful.")
    results["phase5"] = "\n".join(phase5_lines)

    # Store arrays for structured GUI display
    results["tac_raw_list"] = tac
    results["tac_opt_list"] = otac

    import os
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "compiler_output")
    os.makedirs(out_dir, exist_ok=True)

    with open(os.path.join(out_dir, "ast_annotated.json"), "w") as f:
        json.dump(ast, f, indent=2)

    with open(os.path.join(out_dir, "symbol_table.json"), "w") as f:
        json.dump(sym, f, indent=2)

    with open(os.path.join(out_dir, "tac_raw.json"), "w") as f:
        json.dump({"instructions": tac}, f, indent=2)

    with open(os.path.join(out_dir, "tac_optimized.json"), "w") as f:
        json.dump({"instructions": otac}, f, indent=2)

    results["output_dir"] = out_dir
    return results


# ===========================================================================
# SAMPLE SOURCE CODE
# ===========================================================================

SAMPLE_CODE_BARE = """\
// Do-While loop example
int i = 0;
int sum = 0;
int limit = 5;

do {
    sum = sum + i;
    i = i + 1;
} while (i < limit);
"""

SAMPLE_CODE_FULL = """\
#include <iostream>
using namespace std;

int main() {
    int i = 0;
    int sum = 0;
    int limit = 5;

    cout << "Enter limit: ";
    cin >> limit;

    do {
        sum = sum + i;
        i = i + 1;
    } while (i < limit);

    cout << "Sum = " << sum << endl;

    return 0;
}
"""

PHASE_NAMES = ["Phase 1: CFG", "Phase 2: Lexer", "Phase 3: AST",
               "Phase 4: Semantic", "Phase 5: TAC + Opt"]
PHASE_KEYS  = ["phase1", "phase2", "phase3", "phase4", "phase5"]


# ===========================================================================
# GUI — REDESIGNED PROFESSIONAL IDE STYLE
# ===========================================================================

C = {
    # backgrounds
    "root":        "#f5f6fa",
    "header":      "#ffffff",
    "editor":      "#fafafa",
    "linenum":     "#f0f1f5",
    "panel":       "#f5f6fa",
    "card":        "#ffffff",
    "card2":       "#f0f1f5",
    "tab_bar":     "#eef0f5",
    "tab_active":  "#ffffff",
    # borders & dividers
    "border":      "#dde1ea",
    "sep":         "#d0d4de",
    # text
    "text":        "#1a1d2e",
    "text_dim":    "#6b7280",
    "text_muted":  "#9ca3af",
    "linenum_fg":  "#b0b8cc",
    # accents
    "blue":        "#2563eb",
    "blue_dark":   "#1d4ed8",
    "green":       "#16a34a",
    "green_dim":   "#dcfce7",
    "red":         "#dc2626",
    "red_dim":     "#fee2e2",
    "amber":       "#d97706",
    # code colors
    "tac_code":    "#1d4ed8",
    "before":      "#b91c1c",
    "after":       "#15803d",
    "hint":        "#9ca3af",
    "label":       "#7c3aed",
    "tab_text_on": "#2563eb",
    "tab_text_off":"#9ca3af",
    "dot":         "#d1d5db",
    "badge_ok":    "#dcfce7",
    "badge_ok_fg": "#16a34a",
    "badge_err":   "#fee2e2",
    "badge_err_fg":"#dc2626",
}

TAB_NAMES = ["CFG", "Lexer", "AST", "Semantic", "TAC & Optimizer"]


class CompilerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Educational Compiler IDE")
        self.root.geometry("1300x840")
        self.root.minsize(960, 640)
        self.root.configure(bg=C["root"])

        self._setup_styles()
        self._build_header()
        self._build_body()

    # ──────────────────────────────────────────────────────────────────────
    # Styles
    # ──────────────────────────────────────────────────────────────────────

    def _setup_styles(self):
        s = ttk.Style()
        s.theme_use("clam")
        s.configure("IDE.TNotebook",
                    background=C["tab_bar"],
                    borderwidth=0,
                    tabmargins=[0, 0, 0, 0])
        s.configure("IDE.TNotebook.Tab",
                    background=C["tab_bar"],
                    foreground=C["tab_text_off"],
                    padding=[18, 9],
                    font=("Segoe UI", 9),
                    borderwidth=0,
                    relief="flat")
        s.map("IDE.TNotebook.Tab",
              background=[("selected", C["tab_active"]), ("active", C["card"])],
              foreground=[("selected", C["tab_text_on"]), ("active", C["text_muted"])])

    # ──────────────────────────────────────────────────────────────────────
    # Header bar
    # ──────────────────────────────────────────────────────────────────────

    def _build_header(self):
        bar = tk.Frame(self.root, bg=C["header"], height=54)
        bar.pack(fill="x")
        bar.pack_propagate(False)

        # Left: title + phase pills
        lf = tk.Frame(bar, bg=C["header"])
        lf.pack(side="left", padx=20, pady=0)

        tk.Label(lf, text="Educational Compiler IDE",
                 font=("Segoe UI", 12, "bold"),
                 bg=C["header"], fg=C["text"]).pack(side="top", anchor="w", pady=(10, 1))

        pills = tk.Frame(lf, bg=C["header"])
        pills.pack(side="top", anchor="w")
        for i, phase in enumerate(["Lexing", "Parsing", "Semantic", "TAC & Optimizer", "CFG"]):
            if i:
                tk.Label(pills, text=" • ", font=("Segoe UI", 8),
                         bg=C["header"], fg=C["dot"]).pack(side="left")
            tk.Label(pills, text=phase, font=("Segoe UI", 8),
                     bg=C["header"], fg=C["text_dim"]).pack(side="left")

        # Right: status badge + compile button
        rf = tk.Frame(bar, bg=C["header"])
        rf.pack(side="right", padx=20, pady=14)

        self.compile_btn = tk.Button(
            rf, text="Compile",
            font=("Segoe UI", 9, "bold"),
            bg=C["blue"], fg="white",
            activebackground=C["blue_dark"], activeforeground="white",
            relief="flat", bd=0, cursor="hand2",
            padx=22, pady=6,
            command=self._on_compile,
        )
        self.compile_btn.pack(side="right")

        self.badge_var = tk.StringVar(value="")
        self.badge_lbl = tk.Label(
            rf, textvariable=self.badge_var,
            font=("Segoe UI", 8, "bold"),
            bg=C["header"], fg=C["text_dim"],
            padx=8, pady=3,
        )
        self.badge_lbl.pack(side="right", padx=(0, 14))

        # Bottom border
        tk.Frame(self.root, bg=C["sep"], height=1).pack(fill="x")

    # ──────────────────────────────────────────────────────────────────────
    # Main body: editor | output
    # ──────────────────────────────────────────────────────────────────────

    def _build_body(self):
        pw = tk.PanedWindow(self.root, orient="horizontal",
                            bg=C["sep"], sashwidth=3,
                            sashrelief="flat", bd=0)
        pw.pack(fill="both", expand=True)

        left = tk.Frame(pw, bg=C["editor"])
        pw.add(left, width=440)
        self._build_editor(left)

        right = tk.Frame(pw, bg=C["panel"])
        pw.add(right)
        self._build_output(right)

    # ──────────────────────────────────────────────────────────────────────
    # Code editor with line numbers
    # ──────────────────────────────────────────────────────────────────────

    def _build_editor(self, parent):
        editor_row = tk.Frame(parent, bg=C["editor"])
        editor_row.pack(fill="both", expand=True)

        # Line-number gutter
        self.line_canvas = tk.Canvas(
            editor_row,
            width=44,
            bg=C["linenum"],
            highlightthickness=0,
            bd=0,
        )
        self.line_canvas.pack(side="left", fill="y")

        tk.Frame(editor_row, bg=C["sep"], width=1).pack(side="left", fill="y")

        # Scrollbar shared between gutter and editor
        vscroll = tk.Scrollbar(editor_row, orient="vertical")
        vscroll.pack(side="right", fill="y")

        self.code_input = tk.Text(
            editor_row,
            font=("Consolas", 11),
            bg=C["editor"],
            fg=C["text"],
            insertbackground=C["blue"],
            selectbackground="#dbeafe",
            relief="flat", bd=0,
            padx=12, pady=10,
            wrap="none",
            undo=True,
            yscrollcommand=self._on_editor_scroll,
        )
        self.code_input.pack(side="left", fill="both", expand=True)
        self.code_input.insert("1.0", SAMPLE_CODE_BARE)

        vscroll.config(command=self._scroll_both)

        self.code_input.bind("<KeyRelease>", self._redraw_gutter)
        self.code_input.bind("<MouseWheel>", self._redraw_gutter)
        self.code_input.bind("<Button-4>",   self._redraw_gutter)
        self.code_input.bind("<Button-5>",   self._redraw_gutter)
        self.code_input.bind("<Configure>",  self._redraw_gutter)
        self.root.after(50, self._redraw_gutter)

        # Bottom toolbar
        toolbar = tk.Frame(parent, bg=C["header"], height=34)
        toolbar.pack(fill="x", side="bottom")
        toolbar.pack_propagate(False)

        for label, code in [("bare sample", SAMPLE_CODE_BARE), ("full C sample", SAMPLE_CODE_FULL)]:
            tk.Button(
                toolbar, text=label,
                font=("Segoe UI", 8),
                bg=C["header"], fg=C["text_dim"],
                activebackground=C["card"], activeforeground=C["text"],
                relief="flat", bd=0, cursor="hand2",
                padx=10, pady=6,
                command=lambda c=code: self._load_sample(c),
            ).pack(side="left")

    def _on_editor_scroll(self, first, last):
        self.line_canvas.yview_moveto(first)
        self._redraw_gutter()

    def _scroll_both(self, *args):
        self.code_input.yview(*args)
        self._redraw_gutter()

    def _redraw_gutter(self, event=None):
        self.line_canvas.delete("all")
        self.root.update_idletasks()

        w = self.line_canvas.winfo_width()
        fnt = tkfont.Font(font=("Consolas", 11))
        line_height = fnt.metrics("linespace")

        # Determine visible line range
        try:
            first_visible = self.code_input.index("@0,0")
            last_visible  = self.code_input.index(f"@0,{self.code_input.winfo_height()}")
        except Exception:
            return

        first_line = int(first_visible.split(".")[0])
        last_line  = int(last_visible.split(".")[0])

        # y offset of first visible line inside widget
        try:
            bbox = self.code_input.bbox(f"{first_line}.0")
            y_offset = bbox[1] if bbox else 10
        except Exception:
            y_offset = 10

        for lineno in range(first_line, last_line + 2):
            y = y_offset + (lineno - first_line) * line_height
            self.line_canvas.create_text(
                w - 8, y + line_height // 2,
                text=str(lineno),
                anchor="e",
                font=("Consolas", 10),
                fill=C["linenum_fg"],
            )

    # ──────────────────────────────────────────────────────────────────────
    # Output panel
    # ──────────────────────────────────────────────────────────────────────

    def _build_output(self, parent):
        self.notebook = ttk.Notebook(parent, style="IDE.TNotebook")
        self.notebook.pack(fill="both", expand=True)

        self.tab_widgets = {}
        for name in TAB_NAMES:
            frame = tk.Frame(self.notebook, bg=C["card"])
            self.notebook.add(frame, text=f"  {name}  ")

            txt = tk.Text(
                frame,
                font=("Consolas", 10),
                bg=C["card"],
                fg=C["text"],
                selectbackground=C["card2"],
                relief="flat", bd=0,
                padx=18, pady=16,
                state="disabled",
                wrap="none",
                cursor="arrow",
            )
            scroll_y = tk.Scrollbar(frame, orient="vertical",   command=txt.yview)
            scroll_x = tk.Scrollbar(frame, orient="horizontal", command=txt.xview)
            txt.configure(yscrollcommand=scroll_y.set,
                          xscrollcommand=scroll_x.set)

            scroll_x.pack(side="bottom", fill="x")
            scroll_y.pack(side="right",  fill="y")
            txt.pack(fill="both", expand=True)

            # Text display tags
            txt.tag_configure("h1",       font=("Segoe UI", 12, "bold"), foreground=C["text"])
            txt.tag_configure("h2",       font=("Segoe UI", 10, "bold"), foreground=C["text_muted"])
            txt.tag_configure("count",    font=("Segoe UI", 9),          foreground=C["text_dim"])
            txt.tag_configure("tac",      font=("Consolas", 10),         foreground=C["tac_code"],
                              lmargin1=20, lmargin2=20, spacing1=1, spacing3=1)
            txt.tag_configure("tac_bg",   background=C["editor"],
                              lmargin1=20, lmargin2=20)
            txt.tag_configure("before",   font=("Consolas", 9),          foreground=C["before"],
                              lmargin1=52, lmargin2=52)
            txt.tag_configure("after",    font=("Consolas", 9),          foreground=C["after"],
                              lmargin1=52, lmargin2=52)
            txt.tag_configure("hint",     font=("Segoe UI", 8, "italic"),foreground=C["hint"],
                              lmargin1=52, lmargin2=52, spacing3=6)
            txt.tag_configure("label",    font=("Segoe UI", 8, "bold"),  foreground=C["label"],
                              lmargin1=20, lmargin2=20)
            txt.tag_configure("expand",   font=("Segoe UI", 8),          foreground=C["text_dim"],
                              lmargin1=20, lmargin2=20)
            txt.tag_configure("divider",  foreground=C["sep"])
            txt.tag_configure("ok",       foreground=C["green"])
            txt.tag_configure("err",      foreground=C["red"])
            txt.tag_configure("plain",    font=("Consolas", 10),         foreground=C["text"])

            self.tab_widgets[name] = txt

    # ──────────────────────────────────────────────────────────────────────
    # Helpers
    # ──────────────────────────────────────────────────────────────────────

    def _load_sample(self, code):
        self.code_input.delete("1.0", "end")
        self.code_input.insert("1.0", code)
        self._redraw_gutter()
        self.badge_var.set("")

    def _clear_tab(self, name):
        w = self.tab_widgets[name]
        w.config(state="normal")
        w.delete("1.0", "end")
        return w

    def _finish_tab(self, name):
        self.tab_widgets[name].config(state="disabled")

    def _write(self, w, text, *tags):
        w.insert("end", text, tags)

    def _set_plain(self, name, text, error=False):
        w = self._clear_tab(name)
        tag = "err" if error else "plain"
        self._write(w, text, tag)
        self._finish_tab(name)

    # ──────────────────────────────────────────────────────────────────────
    # Structured Optimizer tab
    # ──────────────────────────────────────────────────────────────────────

    def _build_tac_optimizer_tab(self, raw_tac, opt_tac):
        w = self._clear_tab("TAC & Optimizer")

        visible = [x for x in opt_tac if not x.strip().startswith("//")]
        n_vis   = len(visible)

        # ── Optimized TAC Output header ────────────────────────────────
        self._write(w, "\n")
        self._write(w, "  Optimized TAC Output", "h1")
        self._write(w, f"      {n_vis} instructions\n\n", "count")

        # Code block
        for instr in opt_tac:
            s = instr.strip()
            if not s or s.startswith("//"):
                continue
            core = s.split("//")[0].strip()
            self._write(w, f"  {core}\n", "tac", "tac_bg")

        self._write(w, "\n")
        self._write(w, "  " + "─" * 52 + "\n", "divider")

        # ── Collect passes ─────────────────────────────────────────────
        folded     = []
        propagated = []
        dead       = []
        raw_map    = {}

        for instr in raw_tac:
            s = instr.strip()
            if "=" in s:
                dest = s.split("=")[0].strip()
                raw_map[dest] = s

        for instr in opt_tac:
            s = instr.strip()
            if "constant folded" in s:
                core = s.split("//")[0].strip()
                dest = core.split("=")[0].strip()
                folded.append((dest, core, raw_map.get(dest, "")))
            elif "constant propagated" in s:
                core = s.split("//")[0].strip()
                dest = core.split("=")[0].strip()
                propagated.append((dest, core, raw_map.get(dest, "")))
            elif "DEAD CODE" in s:
                dead.append(s)

        n_raw = len([x for x in raw_tac if x.strip() and not x.strip().startswith("//")])

        # ── constant_folding section ───────────────────────────────────
        if folded:
            self._write(w, "\n  constant_folding", "h2")
            self._write(w, f"      {n_raw} -> {n_vis} (delta {n_raw - n_vis})\n", "count")
            for dest, after_code, before_code in folded:
                self._write(w, "    ▶ Before / After Instructions\n", "expand")
                if before_code:
                    self._write(w, f"  REPLACE  {before_code}\n", "label")
                    self._write(w, f"           {before_code}\n", "before")
                self._write(w, f"           {after_code}\n", "after")
                self._write(w, "           Folded constant binary expression.\n", "hint")

        # ── constant_propagation section ──────────────────────────────
        if propagated:
            self._write(w, "\n  constant_propagation", "h2")
            self._write(w, f"      {n_raw} -> {n_vis} (delta {n_raw - n_vis})\n", "count")
            for dest, after_code, before_code in propagated:
                self._write(w, "    ▶ Before / After Instructions\n", "expand")
                if before_code:
                    self._write(w, f"  REPLACE  {before_code}\n", "label")
                    self._write(w, f"           {before_code}\n", "before")
                self._write(w, f"           {after_code}\n", "after")
                self._write(w, "           Instruction rewritten.\n", "hint")

        # ── dead_code_elimination section ─────────────────────────────
        if dead:
            self._write(w, "\n  dead_code_elimination", "h2")
            self._write(w, f"      {len(dead)} removed\n", "count")
            for instr in dead:
                core = instr.replace("// [DEAD CODE ELIMINATED]: ", "").strip()
                self._write(w, f"  ✕ {core}\n", "before")

        if not folded and not propagated and not dead:
            self._write(w, "\n  No optimizations applied (code is already optimal).\n", "hint")

        self._finish_tab("TAC & Optimizer")

    # ──────────────────────────────────────────────────────────────────────
    # Compile action
    # ──────────────────────────────────────────────────────────────────────

    def _on_compile(self):
        source = self.code_input.get("1.0", "end").rstrip()
        if not source.strip():
            messagebox.showwarning("Empty Input", "Please enter source code.")
            return

        self.compile_btn.config(text="Compiling…", state="disabled",
                                bg=C["text_dim"])
        self.badge_var.set("")
        self.root.update_idletasks()

        results = compile_source(source)

        key_to_tab = {
            "phase1": "CFG",
            "phase2": "Lexer",
            "phase3": "AST",
            "phase4": "Semantic",
            "phase5": "TAC & Optimizer",
        }

        has_error = "error" in results

        for key, tab in key_to_tab.items():
            content = results.get(key, "")
            if not content:
                self._set_plain(tab, "(Phase not reached — compilation stopped earlier.)", error=True)
            else:
                err = has_error and key in ("phase2", "phase3", "phase4") and \
                      ("[Error]" in content or "⚠️" in content)
                self._set_plain(tab, content, error=err)

        self.compile_btn.config(text="Compile", state="normal", bg=C["blue"])

        if has_error:
            self.badge_var.set("ERROR")
            self.badge_lbl.config(fg=C["red"])
            for key, idx in [("phase2", 1), ("phase3", 2), ("phase4", 3)]:
                if results.get(key) and ("[Error]" in results.get(key, "") or "⚠️" in results.get(key, "")):
                    self.notebook.select(idx)
                    break
        else:
            self.badge_var.set("SUCCESS")
            self.badge_lbl.config(fg=C["green"])
            self.notebook.select(4)


# ===========================================================================
# CLI FALLBACK
# ===========================================================================

def run_cli():
    print("╔══════════════════════════════════════════════════════╗")
    print("║       DO-WHILE LOOP COMPILER  (Python / CLI)         ║")
    print("║  CFG | Lexer | LL(1) Parser | Semantic | TAC+Opt     ║")
    print("╚══════════════════════════════════════════════════════╝\n")
    print("[1] Bare sample code (no main)")
    print("[2] Full C sample (with #include + main)")
    print("[3] Enter your own code")
    print("[q] Quit\n")

    while True:
        choice = input("Choice: ").strip().lower()
        if choice == 'q':
            break
        elif choice == '1':
            source = SAMPLE_CODE_BARE
        elif choice == '2':
            source = SAMPLE_CODE_FULL
        elif choice == '3':
            print("Enter code (type END on its own line to finish):")
            lines = []
            while True:
                l = input()
                if l.strip() == "END":
                    break
                lines.append(l)
            source = "\n".join(lines)
        else:
            print("Invalid choice."); continue

        results = compile_source(source)
        SEP = "=" * 64
        for name, key in zip(PHASE_NAMES, PHASE_KEYS):
            print(f"\n{SEP}\n  {name}\n{SEP}")
            print(results.get(key, "(not reached)"))

        if "error" in results:
            print(f"\n✗ Compilation failed.")
        else:
            out_dir = results.get("output_dir", "")
            print("\n✅ All 5 phases completed successfully.")
            print(f"\n📁 JSON output files saved to: {out_dir}")
        print()


# ===========================================================================
# ENTRY POINT
# ===========================================================================

if __name__ == "__main__":
    try:
        root = tk.Tk()
        app  = CompilerGUI(root)
        root.mainloop()
    except Exception as e:
        print(f"[GUI not available: {e}]\nFalling back to CLI mode.\n")
        run_cli()
