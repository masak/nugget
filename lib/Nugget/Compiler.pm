class Nugget::Compiler;

my grammar Syntax {
    rule TOP { ^ <statement>* $ }

    token statement {
        <declaration>
    }

    token declaration {
        'var' <.ws> <ident>
    }
}

method compile($program) {
    Syntax.parse($program)
        or die "Couldn't parse $program";
}
