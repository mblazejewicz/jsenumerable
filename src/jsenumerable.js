 

multiplyTest = function (multiplier1, multiplier2) {
return multiplier1* multiplier2;
};
////////////////////////////linq
//function calc(exp) {
//  return exp(5);
//}
//var r = calc(((x) => {
//  return x > 2;
//})); 

//(x=>x>5)(2)
//(x=>{ return x==5;})(5)
//((z,exp)=>{return exp(z);})(1, x=>x>2)
//((z,exp)=>{return exp(z);})(4, x=>{return x>2;})

// type extensions
String.prototype.Contains = function(exp) {
    return this.indexOf(exp) > -1;
  }
  //
//Dodac osługę kolekcji jsDom(rzutowanie na array??)
'use strict';
 
class Enumerable {
  constructor(array) {

    this.QueryableExpArray = [];
    this.Items = array || [];
    this.getEnumeraor = function* getEnumeraor() {
      yield * this.Items;
    }
  }

  Loop(method) {
    var joinedMethods = x => true;
    if (this.QueryableExpArray.length > 0) {
      var joinedMethods = (x) => {
        var v = x.value;
        var res = this.QueryableExpArray.map((fx) => {
          return (fx)(v)
        });
        return res.indexOf(false) === -1;
      }
    }

    var iterator = this.getEnumeraor()
    var item = iterator.next();
    while (!item.done) {
      if (joinedMethods(item) && method(item))
        break;

      item = iterator.next();
    }
  }
  
  Copy(enumerable){
  return new Enumerable(this.Items);
  }

  Any(exp) {
    var result = [];
    var fn = (item) => {
      if ((exp)(item.value)) {
        result = true;
        return true;
      };
      return false;
    };

    this.Loop(fn);
    return result;
  }
  GetAt(idx) {
    if (isNaN(idx))
      throw typeError('Idx must be a number');

    return this.Items[idx];
  }

  First(exp) {
    if (!exp)
      return this.GetAt(0);

    var result = null;
    var fn = (item) => {
      if ((exp)(item.value)) {
        result = item.value;
        return true;
      };
      return false;
    };

    this.Loop(fn);
    return result;
  }

  QWhere(exp) // Queryable, lazy where return EnumarableObj - materialize on Select
    {
      this.QueryableExpArray.push(exp);
      return this;
    }
  Where(exp) {
    var result = [];
    var fn = (item) => {
      if ((exp)(item.value))
        result.push(item.value);
      return false;
    };

    this.Loop(fn);
    this.Items = result;
    return result;
  }
  Select(exp) {
    if (!exp)
      exp = (x) => x;

    var result = [];
    var fn = (item) => {
      result.push((exp)(item.value));
      return false;
    };

    this.Loop(fn);
    //this.Items = result;
    return result;
  }
  Count(exp) {
    var result = this.Items.length || 0;
    if (exp) {
      result = 0;
      var fn = (item) => {
        if ((exp)(item.value))
          result++;
        return false;
      };

      this.Loop(fn);
    }
    return result;
  }

  Min(exp) {
    var first = this.GetAt(0);
    var result = (exp)(first);
    var fn = (item) => {
      var val = (exp)(item.value);
      result = result > val ? val : result;
      return false;
    };
    this.Loop(fn);
    return result;
  }
  Max(exp) {
    var first = this.GetAt(0);
    var result = (exp)(first);
    var fn = (item) => {
      var val = (exp)(item.value);
      result = result < val ? val : result;
      return false;
    };
    this.Loop(fn);
    return result;
  }
  Sum(exp) {
    var result = 0;
    var fn = (item) => {
      var val = (exp)(item.value);
      result += val;
      return false;
    };
    this.Loop(fn);
    return result;
  }
  Avg(exp) {
    return this.Sum(exp) / this.Items.length;
  }

  InsertAt(idx, item) {
    this.Items.splice(idx, 0, item);
    return this;
  }
  Add(item) {
    //var idx = this.Items.length;
    //this.Items.splice(idx, 0,item);
    this.Items.push(item);
    return this;
  }
  Remove(item) {
    var idx = this.Items.indexOf(item);
    if (idx > -1)
      this.Items.splice(idx, 1);
    return this;
  }
  AddRange(items) {
    this.Items = this.Items.concat(items);
    return this;
  }
  RemoveRange(items) {
    var itemCount = Array.isArray(items) ? items.length : 1;
    for (var i = itemCount; i >= 0; i--) {
      var idx = this.Items.indexOf(items[i]);
      if (idx > -1)
        this.Items.splice(idx, 1);

      return this;
    }
  }
  TakeSlice(pageNum, pageCount) {
    var from = (pageNum - 1) * pageCount;
    var to = from + pageCount;
    var count = this.Count();
    return this.Items.slice(from, to > count ? count : to);
  }

  OrderBy(exp) {
    function sortByExp(array, exp) {
      return array.sort(function(a, b) {
        var x = (exp)(a);
        var y = (exp)(b);
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    }
    return sortByExp(this.Items, exp);
  }
  OrderByDesc(exp) {
      var ordered = this.OrderBy(exp);
      return ordered.reverse();
    }
    //ToDo
    //throw Error
    // model danych (def modelu danych), walidacja poprawności dodawanego elementu z modelem
    //dodać model def nazw pól ew typów? 
    //walidacja warunku przed wykonaniem i throw error gdy nie można okreslić wartości //wyrażenia

 //enumerable<object>, c => c.QuestionID,o => o.QuestionID,  (c, o) => new {c, o})
  //en1.Join(en2, en1.Id, en2.Id, )
  
  Join(enumerable, firstEnPropExpr, secondEnPropExpr, resultExpr) {
	  if (!resultExpr)
		  resultExpr = (x,y) => {return {x, y};};

		var result = [];
    var enumerableLocal = enumerable.Copy();
    
		var fn = (item) => {
			let itemPropValue = firstEnPropExpr(item.value);
			let matchExp = x=>secondEnPropExpr(x)===itemPropValue; // extend expr
			let en2FirstmatchedElem =  enumerableLocal.First(matchExp);
			if(en2FirstmatchedElem){
				result.push((resultExpr)(item.value, en2FirstmatchedElem));
        //enumerableLocal.Remove(en2FirstmatchedElem);//remove already joined ??
      }
		  return false;
		};

		this.Loop(fn);
		//this.Items = result;
		return new Enumerable(result);
  
  } 
   
  Except(enumerable) {
  var result = [];
  var exceptPlainJsonArray = enumerable.Select(x=>JSON.stringify(x));
  
  var fn = (item) => {
  			var jsonValue = JSON.stringify(item.value);
        if(exceptPlainJsonArray.indexOf(jsonValue) === -1)
					result.push(item.value);
		  return false;
		};

		this.Loop(fn);
  return new Enumerable(result);  
  }
  
  Intersect(enumerable) {
  var result = [];
  var secondPlainJsonArray = enumerable.Select(x=>JSON.stringify(x));
  
  var fn = (item) => {
  			var jsonValue = JSON.stringify(item.value);
        if(secondPlainJsonArray.indexOf(jsonValue) > -1)
					result.push(item.value);
		  return false;
		};

		this.Loop(fn);
  return new Enumerable(result);  
  }
  
  Distinct(enumerable) {
  var result = [];
  var secondPlainJsonArray = enumerable.Select(x=>JSON.stringify(x));
  
  var fn = (item) => {
  			//elementy z obu zbiorów z wyłączeniem takich samych
		  return false;
		};

		this.Loop(fn);
  return new Enumerable(result);  
  }
  
  //GroupBy(exp) {}
    //ToDictionary(){} ??  
  //Zip() {}
}



module.exports = {
    Enumerable,
    multiplyTest
};