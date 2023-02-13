// if  50 > 90 then

//no redcalering for let, no access before de

const lexer=(srcCode)=>{
    const regex = /\b(if|while)\b|[<=>!]=?|[\d]+|[()]+/g;
    let tokens = [];
    let match;
    while(match = regex.exec(srcCode)){
        let result = 'BinaryExpression';
        if(match[0][0] >='0' && match[0][0]<='9')
            result = 'Litral';
        tokens.push({
            type:  ( match[0] === 'if') ? match[0]+'Statement' : result,
            value: match[0]
        });
       
        }
    return tokens;
}

/*ifStatement -> ifStatement OP Litral Bin litral CL OC 
OP -> '('
Litral -> 60
Bin -> '>...'
Litral -> 60
CL -> ')'*/

let Rules = 
    {
        "ifStatement": "OpenPar Litral BinaryExpression Litral ClosePar OpenCurly",
        "OpenPar" : "(",
        "ClosePar": ")",
        "OpenCurly": "{"
    };
    Array.prototype.insert = function ( index, ...items ) {
        this.splice( index, 0, ...items );
    };
const syntaxAnalyser=()=>{
    tokens = lexer("if 50>60 then ");
        console.log(tokens)

    const length = tokens.length;
    for (let index = 0; index < length; index++) {
            const type = Rules[tokens[index].type];
            
            if (type ==tokens[index].type)
                continue;
            const statement = type.split(' ');
            for(const part of statement){
                index++;

                if(index< tokens.length && tokens[index].type != part){
                    tokens.insert(index, {
                        type : part,
                        value: Rules[part]
                        
                    });
                }else if(index >= tokens.length)
                    tokens.push( {
                        type : part,
                        value: Rules[part]
                        
                    });
           
            }
                console.log(tokens)
    }
    return tokens;
}

console.log(syntaxAnalyser());