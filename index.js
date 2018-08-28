var bigInt = require("big-integer");

const UINT64_MAX = bigInt("18446744073709551615");

var mrcrypt={
    modExp:function (base,exp,mod) {
        var result = bigInt("1");
        while (exp.greater(0)) {
            if (exp.isOdd()) {
                result = (result.multiply(base)).mod(mod);
            }
            base = (base.multiply(base)).mod(mod);
            exp=exp.shiftRight(1);
        }
        return result;
    },
    modMul:function (a,b,mod) {
        if ((a.eq(bigInt("0"))) || (b .lesser(mod.divide(a)))) return (a.multiply(b)).mod(mod);
        var result = bigInt("0");
        a = a.mod(mod);
        while (b.greater(bigInt("0"))) {
            // if b is odd, add a to the result
            if (b.isOdd()) {
                result = (result.add(a)).mod(mod);
            }
            a = (a.shiftLeft(1).mod(mod));
            b =b.shiftRight(1);
        }
        return result;
    },
    keygen:function () {
        var key=new Object();
        var g = bigInt("2");
        var p = bigInt("0");
        do {
            var q = bigInt.randBetween(UINT64_MAX.shiftRight(2),UINT64_MAX.shiftRight(1));
            if ((q.mod(12).notEquals(bigInt("5"))) || (!q.isPrime())) continue;
            p = (q.shiftLeft(1)).add(bigInt("1"));
        } while (p .leq(UINT64_MAX.shiftRight(1)) || !p.isPrime());
        var d = bigInt.randBetween(bigInt("1"),p.minus(bigInt("1")));
        var e2 = this.modExp(g,d,p);
        key.p=p;
        key.g=g;
        key.e2=e2;
        key.d=d;
        return key;
    },
    buf2hex: function (buffer) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    },
    hextoString: function (hex) {
        var arr = hex.split("")
        var out = ""
        for (var i = 0; i < arr.length / 2; i++) {
            var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
            var charValue = String.fromCharCode(tmp);
            out += charValue
        }
        return out
    },
    stringtoHex: function (str) {
        var val = "";
        for (var i = 0; i < str.length; i++) {
            if (val == "")
                val = str.charCodeAt(i).toString(16);
            else
                val += str.charCodeAt(i).toString(16);
        }
        return val
    },
    encrypt:function (p,g,e2,str) {
        if(str.length<1){
            return "";
        }
        var result="";
        var hexstr=this.stringtoHex(str);
        var m=16-hexstr.length%16;
        if(m>0){
            for(var i=0;i<m;i++){
                hexstr+="0";
            }
        }
        var lp=hexstr.length/16;
        for(var i=0;i<lp;i++){
            var dstr=hexstr.substr(i*16,16);
            var bn=bigInt(dstr,16);
            var k = bigInt.randBetween(bigInt(0),p.minus(1));
            var c1 = this.modExp(g,k,p);
            var c2 = this.modMul(this.modExp(e2,k,p),bn,p);
            result+=c1.toString(16);
            result+=",";
            result+=c2.toString(16);
            if(i!=lp-1){
                result+=",";
            }
        }
        return result;

    },
    decrypt:function (p,g,d,str) {
        if(str.length<1){
            return "";
        }
        var strArray = str.split(",");

        var result="";
        var size=strArray.length/2;
        for(var i=0;i<size;i++){
            var c1 = bigInt( strArray[i*2],16);
            var c2 = bigInt(strArray[i*2+1],16);
            var mblock = this.modMul(this.modExp(c1,p.minus(1).minus(d),p),c2,p);
            var mstrhex=mblock.toString(16);
            var mstr=this.hextoString(mstrhex);
            result+=mstr;
        }
        return result;
    }
}
module.exports = mrcrypt;