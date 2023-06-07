    // ** Def rules ** //

    //Expr              ::= BinaryExpression | IntLitreral | stringLitreral | id
    //BinaryExpression  ::= Expr Operation Expr
    //Operation         ::= add | sub | mul | div
const Operation={
   'MoreThan' : 0 ,
    'LessThan': 1 ,
    'And'     : 2 ,
    'Or'      : 3 ,
    'Equal'   : 4 ,
};

/**
 * @typedef {string} NodeType
 * A string literal type representing the different types of AST nodes.
 */

/**
 * @type {Object<NodeType>}
 * An object with string keys representing the different types of AST nodes,
 * and string values that are the same as the keys.
 */
const NodeType = {
    Program: "Program",
    IntLiteral: "IntLiteral",
    StringLiteral: "StringLiteral",
    Identifier: "Identifier",
    BinaryExpression: "BinaryExpression",
  };

class Stmt{
    constructor(){
        this.kind = NodeType
    }
}

class Program extends Stmt{
    constructor(){
        this.kind = "Program";
        this.body = []; // array of Stmt
    }
}

class Expr extends Stmt{

}

class IntLiteral extends Expr{
    constructor(){
        this.kind = "IntLiteral";
        this.value = 0;
    }
}

class StringLiteral extends Expr{
    constructor(){
        this.kind = "StringLiteral";
        this.value = "";
    }
}

class Identifier extends Expr{
    constructor(){
        this.kind = "Identifier";
        this.value = "";
    }

}

class BinaryExpression extends Expr{
    constructor(){
        this.kind = "BinaryExpression";
        this.lhs = Expr;
        this.rhs = Expr;
        this.operater = Operation; 
    }
}