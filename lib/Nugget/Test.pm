use v6;
use Test;
use Nugget::Compiler;

module Nugget::Test;

my $compiler = Nugget::Compiler.new();

sub compiles_ok($program, $message = $program) is export {
    $compiler.compile($program);
    ok True, $message;
}

sub compiler_error($program, $expected_error,
                   $message = $expected_error) is export {

    my $actual_error = "(no error)";
    try {
        $compiler.compile($program);
        CATCH { default { $actual_error = ~$_ } }
    }
    is $actual_error, $expected_error, $message;
}
