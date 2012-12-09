use v6;
use Test;
use Nugget::Test;

plan 2;

compiles_ok 'var foo', 'declaration with the "var" keyword';
compiles_ok 'var bar', 'a different declaration';
