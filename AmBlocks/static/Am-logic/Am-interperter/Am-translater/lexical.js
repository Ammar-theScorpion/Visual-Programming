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
    String:17,
    EOC : 18,
  };
  const KEYWORDS = {
    if:   TokenType.If,
    else: TokenType.Else,
    then: TokenType.Then,
    repeat: TokenType.Repeat,
    int: TokenType.Int,
    float: TokenType.Float,
    string: TokenType.String,
    print:TokenType.Print,
  };
  
  function Token(value, type) {
    this.value = value; 
    this.type = type; 
  }

  function token(value = '', type) {
    return new Token(value, type);
  }
  
  function isalpha(src) {
    return src.toUpperCase() !== src.toLowerCase();
  }
  
  function isskippable(str) {
    return str === ' ' ||  str === '\t';
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
      if (src[0] === '(') {
        tokens.push(token(src.shift(), TokenType.OpenParen));
      } else if (src[0] === ')') {
        tokens.push(token(src.shift(), TokenType.CloseParen));
      }  else if (src[0] === '{') {
        tokens.push(token(src.shift(), TokenType.OpenCurly));
      } else if (src[0] === '}') {
        tokens.push(token(src.shift(), TokenType.CloseCurly));
      } 
      else if (src[0] === '+' || src[0] === '-' || src[0] === '*' || src[0] === '/' || 
              src[0] === '>'|| src[0] === '<'|| src[0] === '>=' || src[0] === '<=' || src[0] === '==' || src[0] === '&&' || src[0] === '||') {
        tokens.push(token(src.shift(), TokenType.BinaryOperator));
      }  
      else if (src[0] === '=') {
        tokens.push(token(src.shift(), TokenType.Equals));
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
          if(src.length)
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

            } else {
                tokens.push(token(ident, TokenType.Identifier));
            }
        } else if(src[0] === '\n'){

              tokens.push(token(src.shift(), TokenType.newLine));

        } else if (isskippable(src[0])) {
              src.shift();
          }  
  
        }
    }tokens.push(token('', TokenType.EOC))
    return tokens
}