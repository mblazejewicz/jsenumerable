//var jsenumerable = require("../src/jsenumerable");
const {Enumerable, multiplyTest} =require("../src/jsenumerable");

describe("multiplication", function () {
  it("should multiply 2 and 3", function () {
    var product = multiplyTest(2, 3);
    expect(product).toBe(6);
  });
});  

var arr = [6,2,4,5,7,8,1];
var jarr = [{Id:3, Name:'tst3'},{Id:2, Name:'tst2'},{Id:1, Name:'tst1'},{Id:6, Name:'rtst36'}, {Id:5, Name:'36ts36t5'}];

describe("Any_ValueArray", function () { 
	it("should find item >5", function () {
		var result =new Enumerable(arr).Any(x=>x>5); 
		expect(result.length!=0).toBe(true);
	});
	
	it("should'nt find item >100 && < 0", function () {
	var result =new Enumerable(arr).Any(x=>x<100 && x<0);	
	expect(result.length == 0).toBe(true);
  }); 
});

 