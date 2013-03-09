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
            if ('+*-/~!?'.indexOf(text.charAt(pos)) > -1 ) {
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
            var any_of = function() {
                for (var t in arguments) {
                    if (op.value === arguments[t]) {
                        return true;
                    }
                }
                return false;
            };
            if (any_of('infix:<+>', 'infix:<->')) {
                return 1;
            }
            if (any_of('infix:<*>', 'infix:</>')) {
                return 2;
            }
            if (any_of('prefix:<+>', 'prefix:<->', 'prefix:<~>', 'prefix:<!>', 'prefix:<?>')) {
                return 3;
            }
            throw "Don't know the tightness of " + op.value;
        }
        var top_op = function() { return opstack[opstack.length - 1] }
        var reduce = function() {
            var optree = opstack.pop();
            if (optree.value.substr(0, 5) === 'infix') {
                var rhs = termstack.pop(),
                    lhs = termstack.pop();
                optree.children = [lhs, rhs];
            }
            else { // prefix or postfix
                var operand = termstack.pop();
                optree.children = [operand];
            }
            return optree;
        }
        var still_in_expression = function() {
            var type = tokens.next().type;
            return type === 'operator' || type === 'literal';
        }

        var expect = 'term';
        while (still_in_expression()) {
            var type = tokens.next().type;
            var op;
            if (expect === 'term' && type === 'literal') {          // found term
                termstack.push(tokens.next());
                tokens.advance();
                expect = 'operator';
            }
            else if (expect === 'term' && type === 'operator') {    // found prefix
                op = tokens.next();
                op.value = 'prefix' + op.value.substr(5);
                opstack.push(op);
                tokens.advance();
                expect = 'term'; // still
            }
            else if (expect === 'operator' && type === 'literal') { // two terms in a row
                throw "Two terms in a row: " + termstack.pop() + " " + tokens.next();
            }
            else if (expect === 'operator' && type === 'operator') { // found infix or postfix
                // only handing the infix case just now
                op = tokens.next();
                if (opstack.length == 0 || tightness(top_op()) < tightness(op)) {
                    opstack.push(op);
                    tokens.advance();
                    expect = 'term';
                }
                else {
                    termstack.push(reduce());
                    expect = 'operator'; // still
                }
            }
        }
        if (expect === 'term') {
            throw "Expected term after " + termstack.pop();
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
