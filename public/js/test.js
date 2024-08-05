var reg = new RegExp("^([^A-Z]*|[^a-z]*|[^\\W]*|[^0-9]*)$");

var a = "Yanny-1201";
var b = "aaaaaaaaaaaaaa";
var c = "012-asAFAS";
var d = "sa-ASAsd";
var e = "-123-1SAFS";

console.log(reg.test(a));
console.log(reg.test(b));
console.log(reg.test(c));
console.log(reg.test(d));
console.log(reg.test(e));