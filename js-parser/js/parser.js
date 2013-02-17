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
            if (text.charAt(pos) == '+') {
                ++pos;
                return { type: 'operator', value: 'infix:<+>' };
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
        var expression = tokens.next();
        tokens.advance();
        while (tokens.next().type === 'operator') {
            var lhs = expression;
            var optree = tokens.next();
            tokens.advance();
            var rhs = tokens.next();
            tokens.advance();
            optree.children = [lhs, rhs];
            expression = optree;
        }
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

    return {
        type: 'statements',
        children: statements
    };
}
