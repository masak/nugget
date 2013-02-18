"use strict";

var parse = function (text) {
    var tokenize = function() {
        var next_token = undefined;
        var pos = 0;

        var grab_next_token = function() {
            while (text.charAt(pos) == ' ') {
                ++pos;
            }
            if (pos >= text.length) {
                return { type: 'EOF' };
            }
            if (text.charAt(pos) >= '0' && text.charAt(pos) <= '9') {
                var start = pos,
                    stop  = pos + 1;
                while (text.charAt(stop) >= '0' && text.charAt(stop) <= '9') {
                    ++stop;
                }
                var number = text.substr(start, stop - start);
                pos = stop;
                return { type: 'literal', value: parseInt(number, 10) };
            }
            if ('+*'.indexOf(text.charAt(pos)) > -1 ) {
                // we're a bit special-cased on single-char ops so far
                var value = 'infix:<' + text.charAt(pos) + '>';
                ++pos;
                return { type: 'operator', value: value };
            }
            throw "Don't know how to tokenize " + text.charAt(pos) + " at position " + pos;
        }

        return {
            next: function() { return next_token },
            advance: function() { next_token = grab_next_token() }
        };
    };

    var parse_statement = function() {
        return parse_expression();
    };

    var parse_expression = function() {
        var termstack = [];
        var opstack = [];
        var tightness = function(op) {
            if (op.value === 'infix:<+>') {
                return 1;
            }
            if (op.value === 'infix:<*>') {
                return 2;
            }
            throw "Don't know the tightness of " + op.value;
        }
        var top_op = function() { return opstack[opstack.length - 1] }
        var reduce = function() {
            var optree = opstack.pop();
            var rhs = termstack.pop(),
                lhs = termstack.pop();
            optree.children = [lhs, rhs];
            return optree;
        }

        termstack.push(tokens.next());
        tokens.advance();
        while (tokens.next().type === 'operator') {
            var op = tokens.next();
            if (opstack.length == 0 || tightness(top_op()) < tightness(op)) {
                opstack.push(op);
                tokens.advance();
                termstack.push(tokens.next());
                tokens.advance();
            }
            else {
                termstack.push(reduce());
            }
        }
        while (opstack.length > 0) {
            termstack.push(reduce());
        }
        var expression = termstack[0];
        return {
            type: 'expression',
            children: [
                expression
            ]
        };
    };

    var tokens = tokenize();
    tokens.advance();
    var statements = [];
    while (tokens.next().type !== 'EOF') {
        statements.push( parse_statement() );
    }

    var program = { type: 'statements' };
    if (statements.length > 0) {
        program.children = statements;
    }
    return program;
}
