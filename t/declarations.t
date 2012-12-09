use v6;
use Test;
use Nugget::Test;

plan 4;

compiles_ok 'var foo', 'declaration with the "var" keyword';
compiles_ok 'var bar', 'a different declaration';

compiles_ok 'let foo', 'declaration with the "let" keyword';
compiler_error
    'diggeridoo foo',
    "Didn't recognize code as a statement at line 1 column 1",
    'cannot use any old keyword to declare';
