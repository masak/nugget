use v6;
use Test;
use Nugget::Compiler;

module Nugget::Test;

my $compiler = Nugget::Compiler.new();

sub compiles_ok($program, $message = $program) is export {
    my $success = True;
    try {
        $compiler.compile($program);
        CATCH { default { $success = False } }
    }
    ok $success, $message;
}
