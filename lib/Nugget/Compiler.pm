class Nugget::Compiler;

my grammar Syntax {
    rule TOP { ^ <statement>* $ }

    token statement {
        [
        | <declaration>
        | \S+ <.panic: "Didn't recognize code as a statement">
        ]
    }

    token declaration {
        <decl_keyword> <.ws> <ident>
    }

    token decl_keyword { 'var' | 'let' }

    method panic($message) {
        my $line = 1;
        my $column = 1;
        die "$message at line $line column $column";
    }
}

method compile($program) {
    Syntax.parse($program)
        or die "Couldn't parse: $program";
}
