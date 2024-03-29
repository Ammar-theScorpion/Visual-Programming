export const TokenType = {
    Number: 0,
    String: 1,
    Identifier: 2,
    Int: 3,
    BinaryOperator: 4,
    Equals: 5,
    OpenParen: 6,
    CloseParen: 7,
    OpenCurly: 8,
    CloseCurly: 9,
    If:10,
    Else:11,
    Then:12,
    Repeat:13,
    Print:14,
    newLine:15,
    Float:16,
    Def: 18,
    Call: 19,
    Each: 20,
    SpecChar:21,
    List:22,
    Create:23,
    Return:24,
    CreateL:25,
    Class:26,
      Private:27,
      Public:28,
    Strings:29,
    NULL:32,
    UN:33,
    For:34,
    Math:35,
    op:36,
    turn:37,
    move:38,
    color:39,
    pen:40,
    Break:41,
    colour:42,
    Bool:43,
    EOC : 45,
  };
  const KEYWORDS = {
    if:   TokenType.If,
    else: TokenType.Else,
    then: TokenType.Then,
    while: TokenType.Repeat,
    int: TokenType.Int,
    float: TokenType.Float,
    string: TokenType.String,
    print:TokenType.Print,
    def:TokenType.Def,
    call:TokenType.Call,
    each:TokenType.Each,
    list:TokenType.List,
    allfather:TokenType.Create,
    allfatherL:TokenType.CreateL,
    class:TokenType.Class,
      private:TokenType.Private,
      public:TokenType.Public,

    NULL:TokenType.NULL,
    strings:TokenType.Strings,
    math:TokenType.Math,
    for:TokenType.For,
    break:TokenType.Break,
    true:TokenType.Bool,
    false:TokenType.Bool,
    
    return:TokenType.Return,
  };

  function Token(value, type) {
    this.value = value; 
    this.type = type; 
  }

  function token(value = '', type) {
    return new Token(value, type);
  }
  
  function isalpha(src) {
    return src.toUpperCase() !== src.toLowerCase() || src=='_'|| src==':'|| src=='^';
  }
  
  function isskippable(str) {
    return str == " " ||  str === '\t';
  }
  
  function isint(str) {
    const c = str.charCodeAt(0);
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
    return (c >= bounds[0] && c <= bounds[1]) || c==46;
  }
  
  export function tokenize(sourceCode) {
    const tokens = [];
    const src = sourceCode.split('');
    while (src.length > 0) {
 
     if (src[0] === '{') {
        tokens.push(token(src.shift(), TokenType.OpenCurly));
      } else if (src[0] === '}') {
        tokens.push(token(src.shift(), TokenType.CloseCurly));
      }else if (src[0] === ',' || src[0] === '[' || src[0] === ']' || src[0] === '(' || src[0] === ')' || src[0] === '!') {
        tokens.push(token(src.shift(), TokenType.SpecChar));
      }  
      else if (src[0] === '+' || src[0] === '-' || src[0] === '*' || src[0] === '/' || 
              src[0] === '>' || src[0] === '<'|| src[0] === '&' || src[0] === '|' || src[0] === '%') {
                let s = src.shift();
          if(src[0] === '=')
              s+=src.shift()
        tokens.push(token(s, TokenType.BinaryOperator));
      }  
      else if (src[0] === '=') {
        let s = src.shift();
        if(src[0] === '='){
            s+=src.shift()
            tokens.push(token(s, TokenType.BinaryOperator));
        }else
        tokens.push(token(s, TokenType.Equals));
      }  
      else {
        if(src[0]=="'"){
            let string = src.shift();
            while(src.length > 0 && src[0] != "'"){
                string+=src.shift();
            }
            string+=src.shift();
          tokens.push(token(string, TokenType.String));
        }
        else if(src[0]=="\""){
          let string = src.shift();
          while(src.length > 0 && src[0] != "\""){
              string+=src.shift();
          }
          string+=src.shift();
        tokens.push(token(string, TokenType.String));
      }
         else if (isint(src[0])) {
          let num = '';
          while (src.length > 0 && isint(src[0])) {
            num += src.shift();
          }
  
          tokens.push(token(num, TokenType.Number));
        } 
        else if (isalpha(src[0])) {
                     
            let ident = '';
            while (src.length > 0 && isalpha(src[0])) {
                ident += src.shift();
            }
    
            const reserved = KEYWORDS[ident];
            if (reserved !== undefined) {
                tokens.push(token(ident, reserved));
                
            }else if(TokenType[ident]){
                tokens.push(token(ident, TokenType[ident]));

            } else {
                tokens.push(token(ident, TokenType.Identifier));
            }
        } else if(src[0] === '\n'){

              tokens.push(token(src.shift(), TokenType.newLine));

        } else if (isskippable(src[0])) {
              src.shift();
          }else{
            tokens.push(token(src.shift(), TokenType.newLine));
          }
  
        }
    }tokens.push(token('', TokenType.EOC))
    return tokens
}