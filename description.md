# Nugget, a small language

## Introduction

I want to create a language that's "small but nice". Languages such as JavaScript and Lua have a small core that Nugget aims to capture. The few features it has should basically make people nod their heads and go "yes, that looks sane".

## Future plans

With time, I plan to develop a number of extensions to the language, to try out various ideas. These include:

* Gradual typing
* Statically checked `handles` trait (requires typing)
* ADTs, unification and pattern matching (requires typing)
* Junctions (as syntactic sugar, erased at compile-time)
* Roles (requires typing, would provide runtime poly)
* Grammars
* Operator overloading (requires grammars)
* Macros
* LINQ-like selection syntax (semi-requires macros)
* A focus on nice ways to manipulate data structures and parts of data structures
* Name spaces and encapsulation

But described below is the core, and it's rather small. Anything which feels interesting but non-essential for a small language ends up in the list above.

## Syntax

### Literals

The literals `true` and `false` represent **boolean literals** in the language.

Here's a summary of what's allowed and what isn't for **numeric literals**:

    42            # integer
    1000000       # integer
    4294967296    # integer
    -18           # negative integer
    +500          # positive integer (signs are part of the literal)
    -0            # allowed (but numerically 0)
    0xACED        # hex integer
    0xcafebeef    # hex integer
    0b10101010    # binary integer
    01234         # not an octal integer (gives a warning)
    0.5           # rational
    -0.0001       # rational
    +1e3          # float
    52e-20        # float
    4_294_967_296 # isolated underscores are allowed in integers
    0xCAFE_BEEF   # also for hex and binary integers
    0x5.2         # PARSE ERROR: cannot combine hex/bin and rational
    0b1111e10     # PARSE ERROR: cannot combine hex/bin and float

Trying to represent an integer literal that doesn't fit in a signed 64-bit int results in a parse error. Use a bigint library. Rational literals similarly give an error if they cannot be exactly represented with a 64-bit numerator and a 32-bit denominator.

String literals are delimited with single or double quotes.

    'OH HAI'
    "OH HAI again"

A number of escapes are recognized. They work exactly the same in single-quoted and double-quoted strings.

    \'         single quote
    \"         double quote
    \\         backslash
    \a         alarm (bell)
    \b         backspace
    \e         escape
    \f         form feed
    \n         newline
    \r         return
    \t         tab
    \c[13,10]  CR LF
    \x[d,00a]  CR LF (using hex)

You can have newlines inside of strings. You can have literal tab characters, too, but it's recommended you use `\t`.

There's no variable interpolation in strings. Use a templating library.

### Identifiers

The user gives variables, constants, and classes names, and these names are known as **identifiers**. An identifier may contain alphanumeric characters and underscores. It may not start with a digit.

There may or may not be a very high upper limit to identifier length, such as 255 characters, but it doesn't really matter. It's considered bad taste to have identifiers longer than 40 characters.

### Keywords

These words are keywords in the language, so you can not use them as identifiers.

    clone def does else class false fun for handle has if last loop
    next redo repeat return throw true undefined unless until var while

### Statements

Statements are separated by semicolons. It's always fine to put a semicolon after the final statement in a block.

    say 2 + 2;
    say "I said four";

### Comments

Comments start with `#` and continue to the end of the line.

    say distance / time;  # km/h

### Blocks

Blocks are curly braces surrounding one or more statements.

    {
        say "I told you!";
    }

Whitespace is not significant; the indentation is just culturally encouraged.

### Variables

Variables are lexical by default, meaning that they are only visible from the point of their declaration to the end of the innermost surrounding block.

    {
        var a = 42;
        {
            # only a visible
            var b = "OH HAI";
            # both a and b visible
        }
        # only a visible
    }

An variable is only visible if it has been declared first in the same scope. A small exception is the `new` blocks; see below.

### Declarations

Besides `var` which declares names for mutable values, there's also `let` and `def`:

    def foo = ...;   # compile-time, can not change it
    let bar = ...;   # runtime, can not change it
    var baz = ...;   # a variable

Both `def` and `let` require an assignment in connection with the declaration. `var` doesn't.

It's possible to do several variable declarations in one statement, by separating them with a comma:

    var a, b, c;
    let start = 0,
        end   = 100,
        step  = 10;

### Functions

All functions are anonymous. You give a function a name by assigning it to a variable.

    def fib = fun(n) {
        if n < 2 {
            return n;
        }
        else {
            return fib(n-1) + fib(n-2);
        }
    };

The parentheses after `fun` are optional; if the function doesn't take any parameters, you can leave them out. The final semicolon is required, if you're planning on more statements after the function definition.

It's possible to call a function before declaring it, as long as it's declared before the end of the compilation unit. This allows functions to be mutually recursive.

Three conditions cause the compiler to consider the mention of a function to be a *call* to that function:

1. If it it followed by parentheses: `say("OH ", " ", "HAI");` Intervening whitespace is fine, too: `say ("OH ", " ", "HAI");`
2. If it is followed by one or more expressions, separated by commas: `say "OH", " ", "HAI";`
3. If it occurs alone in a statement. (Or `if` statement condition, etc.)

If none of the above hold, the mention of the function will parse as the function itself, not a call to it.

    def four = fun { return 4 };
    def add = fun(x, y) { return x + y };
    say four();    # 4, by rule 1
    say four;      # <function>
    say add 40, 2; # 42, by rule 2
    say;           # empty line, by rule 3

### Conditionals

In an `if` statement, parentheses are not required, but the curly braces are.

    if n < 2 {
        return n;
    }

An `if` statement may be followed up by any number of `if else` statements, and optionally an `else` statement at the end.

    if sth1 {
        # ...
    }
    else if sth2 {
        # ...
    }
    else if sth3 {
        # ...
    }
    else {
        # ...
    }

There is an `unless` conditional too, which doesn't accept `else` clauses.

### Loops

`for` loops have only the modern iteration form.

    for list -> elem {
        # ...
    }

The `-> elem` part is optional. There's no default iteration variable though, so if you don't provide a name, the value is not accessible from within the block.

`while` loops are also available:

    while condition {
        # ...
    }

There's also a variant, `repeat while`, which runs at least once.

    repeat while condition {
        # ...
    }

Here, the condition is tested *after* each iteration, instead of before it. To reflect this, you can also put the condition after the loop block:

    repeat {
        # ...
    } while condition;

In this case, a semicolon is needed to separate statements.

The `until` and `repeat until` loops are available, too.

Finally, there's `loop`, which iterates forever.

    loop {
        # ...
    }

In all these kinds of loop constructs, the following three statements can be used:

    next;     # skip immediately to the next iteration (if any)
    last;     # abort the loop immediately
    redo;     # re-start this iteration, don't test condition

Using these loop control statements outside of any loop, or inside a function body in a loop, triggers a compile-time error.

### Statement-ending conditionals and loops

These five short forms also exist:

    last        if a == b;
    next        unless n > 0;
    countdown   while count > 0;
    countdown   until count == 0;
    dance       for list;

But note that there is no way to bind an element variable in the statement-ending `for` form.

These forms do not nest. The following, for example, is not allowed:

    dance if rand() < .5 for list;  # ILLEGAL; no nesting statement modifiers

### Loop labels

Before a `for`, `while`, `until`, `repeat`, or `loop` construct, you can place a **label**:

    LINE: for lines -> line {
        let words = ...;
        WORD: while words.any {
            next WORD if ...;
            last LINE unless ...;
        }
    }

With the help of labels, loop control constructs can bind on any surrounding loop block, not just the innermost one.

It's not possible to put labels on non-loop statements.

### Exceptions

A `handle` block looks like this:

    handle -> e {
        # ...
    }

Somewhere deeper down the call chain, there might be a `throw` statement:

    throw new Exception.IllegalArgument;

### Classes

A class introduces a lexically scoped name into the program:

    def Complex = class {
        has x = 0;
        has y = 0;
    
        # method declarations
    };

Only `def` and `has` declarations are allowed within the class block. `def` is for class-level constants and methods; `has` is for public properties. There are no private properties.

### Property traits

The properties of a class can be optionally configured with traits.

    def Person = class {
        has birth_date (frozen);
        has age (lazy) = (Date.today - birth_date).years;
    };

    def Employee = class {
        has first_name (required);
        has last_name (required);
        has full_name (computed) = first_name ~ " " ~ last_name;
    };

Some traits take an argument, which must resolve to a method defined in the same class block.

    def Manager = class {
        has title (trigger: when_title_set);
        has description (lazy, builder: build_description);
    };

### The keyword `new`

Any property thus introduced can then be accessed through instances of that class:

    let c = new Complex;
    say c.x;    # 0

If you want, you can follow the constructor invocation with an initialization block, like so:

    let c2 = new Complex {
        x = sqrt(2);
        y = sqrt(2);
    };

Assigning to things that are not properties of the class triggers a compile-time error. Not supplying values to properties marked `required` is also an error. Assigning to `frozen` properties is allowed within this initialization block but disallowed outside of it.

If you're feeling adventurous, you can even instantiate an object *without* a class declaration:

    let o = new {
        firstname = "Michael";
        lastname = "Jackson";
    };

As expected, these are *not* checked against a corresponding class definition, since this essentially is the class definition. For this syntax, you can prefix the variable assignments with `has` if you want.

    let o = new {
        has firstname = "Michael";
        has lastname = "Jackson";
    };

### Methods

A method declaration is simply a `def` inside a class declaration, assigning to a function.

    def Complex = class {
        # property declarations
    
        def abs = fun (c:) { return abs c.x * c.x + c.y * c.y };
        def conj = fun (c:) { return new Complex { x = c.x; y = -c.y } };
    }

Note the optional `c:`, allowed exactly on this kind of function. It's our chance to name the method's invocant, so that we can refer to it and its properties in the function. If (and only) if you don't provide an invocant, the function will be callable on the class itself, in addition to each instance.

As opposed to the `new` block, just referring to the properties as `x` and `y` will not work in methods; they have to be referred to as `c.x` and `c.y`. Note that this is true for properties defined using `has`; identifiers defined in the class block using `def`, `let` or `var` are visible as usual.

Methods are invoked like this:

    contest.start(player1, player2, player3);   # method call, by rule 1
    contest.start (player1, player2, player3);  # method call, by rule 1
    contest.start player1, player2, player3;    # method call, by rule 2

Just as with functions, either parentheses or a list of arguments are required to make it a method call, unless the property access is alone in a statement:

    say c2.abs;      # <function>
    constest.start;  # method call, by rule 3

### The keyword `clone`

An alternative way to create new instances is to use the `clone` keyword. The definition of the `.conj` method above could have been written like this:

    def conj = fun (c:) { return clone c { y = -c.y } };

The `clone` keyword expects an existing object and then a block that works just like with `new`. If the type of the object can be inferred (as it can here), only declared properties are recognized in the block.

Assigning to `required` properties is not necessary in this kind of initialization block. (Because it has already been provided in the original object, and will be copied across.) Assigning to `frozen` properties is allowed, on the grounds that this is an object initialization.

### Inner classes

    def Graph = class {
        has nodes;
        # ...
        def Node = class {
            has edges;
            # ...
            def neighbors = fun (graph, node1:) {
                return graph.nodes.grep fun(node2) { adjacent(node1, node2) };
            };
        };
    };

Two things are worth noting here:

* It's possible to define a class nested inside another. This is just a consequence of `def` clauses being allowed inside classes.

* The `neighbors` method has two invocants. One is for a `Graph` instance, and one is for a `Node` instance. Each method in an inner class gets to declare zero, one, or two invocants like this. (If it declares one invocant, it would be a `Node`, the inner one.) More generally, a method gets to declare as many invocants as there are class declarations surrounding it.

### Operators

Here's a table of all the operators:

    A  Level             Operators
    =  =====             =========
       Terms             42 3.14 "eek" some_identifier
    L  Property lookup   .prop
    N  Autoincrement     ++ --
    R  Exponentiation    **
    L  Symbolic unary    + - ~ ! ?
    L  Multiplicative    * / % %%
    L  Additive          + -
    L  Replication       x
    L  Concatenation     ~
    N  Structural infix  <=>
    N  Chaining infix    != == < <= > >=
    L  And               &&
    L  Or                || //
    R  Conditional       ?? !!
    R  Assignment        = **= *= /= %= %%= += -= x= ~= &&= ||= //=
    R  List prefix       say
       Terminator        ; {...}, unless, extra ), ], }

The three forms of associativity for each level are indicated in the column to the left. They direct how a chain of operator from the same level bunch together.

       Associativity      Meaning of a op b op c
       =============      ======================
    L  Left               (a op b) op c
    R  Right              a op (b op c)
    N  None               ILLEGAL

For unary operators, this is interpreted as follows:

       Associativity      Meaning of !a!
       =============      ==============
    L  Left               (!a)!
    R  Right              !(a!)
    N  None               ILLEGAL
