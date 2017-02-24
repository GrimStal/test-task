var arr = [
  {
	lat: 50.299552,
	lng: 27.544192
  },
  {
	lat: 46.140133,
	lng: 25.488293
  },
  {
	lat: 53.700841,
	lng: 26.553202
  },
  {
	lat: 52.365984,
	lng: 21.204397
  },
  {
	lat: 49.644004,
	lng: 10.933664
  },
  {
	lat: 47.50846,
	lng: 31.426614
  },
  {
	lat: 55.862639,
	lng: 21.085906
  },
  {},
  {sadasd: '90909', lat: null}
];

var DistanceBuilder = function() {

  this.getWays = function(arr) {
	var array = arr.filter(dataValidateFilter);
	var possible = getPossibleWays(array);

	return possible = duplicateFilter(possible);
  };

  function duplicateFilter(possible) {
	for (var i = possible.length; i > 0; i--) {
	  for (var index = possible.length; index > 0; index--) {
		if (i !== index) {
		  var reverse = possible[index-1].slice(0, possible[index-1].length).reverse();
		  var origin = possible[i-1];
		  var duplicate = true;

		  if (!origin) {
		    console.log(i-1, index-1, possible);
		  }

		  for (var ind = origin.length; ind > 0; ind--) {
			if ((origin[ind-1].lat !== reverse[ind-1].lat) &&
				(origin[ind-1].lng !== reverse[ind-1].lng)) {
			  duplicate = false;
			  break;
			}
		  }

		  if (duplicate) {
			possible.splice(index-1, 1);
			i--;
			index--;
		  }
		}
	  }
	}

	return possible;
  }

  function dataValidateFilter(el) {
	var lng;
	var lat;
	if ('lng' in el && 'lat' in el) {
	  lng = parseFloat(el.lng);
	  lat = parseFloat(el.lat);
	  return ((lng <= 180 && lng >= -180) && (lat >= -90 && lat <= 90));
	}
	return false;
  }

  function getStartWays(arr) {
	var mainarr = [];

	for (var i = arr.length ; i !== 0; i--) {
	  for (var index = arr.length; index !== 0; index--) {
		if (index !== i) {
		  mainarr.push([arr[i-1], arr[index-1]]);
		}
	  }
	}

	return mainarr;
  }

  function getPossibleWays(arr) {
	var mainarr = getStartWays(arr);

	if (mainarr && mainarr.length > 2) {
	  for (var i = arr.length; i !== 2; i--) {
		mainarr = addNextStepWays(mainarr, arr);
	  }
	}

	return mainarr;
  }

  function getNextPossibleWays(points, array) {
	var ways = [];

	for (var i = array.length; i !== 0; i--) {
	  if (array[i - 1] === points.last()) {
		for (var index = array.length; index !== 0; index--) {
		  if (index !== i && !~points.indexOf(array[index - 1])) {
			ways.push([array[index - 1]]);
		  }
		}
	  }
	}

	return ways;
  }

  function addNextStepWays(currentArr, fullArr) {
	var mainArr = [];

	for (var i = currentArr.length; i !== 0; i--) {
	  var nextPoints = getNextPossibleWays(currentArr[i - 1], fullArr);
	  for (var index = nextPoints.length; index !== 0; index--) {
		mainArr.push(currentArr[i - 1].concat(nextPoints[index-1]));
	  }
	}
	return mainArr;
  }

  this.getDistance = function MathDistance(first, second) {
	if (!dataValidateFilter(first) || !dataValidateFilter(second)) {
	  return 'Mistake - unavailable coordinates';
	}

	var pi = Math.PI;
	var rad = 6372.795;
	var firstLongRad = first.lng * pi / 180;
	var firstLatRad = first.lat * pi / 180;
	var secondLongRad = second.lng * pi / 180;
	var secondLatRad = second.lat * pi / 180;

	var cl1 = Math.cos(firstLatRad);
	var cl2 = Math.cos(secondLatRad);
	var sl1 = Math.sin(firstLatRad);
	var sl2 = Math.sin(secondLatRad);
	var delta = secondLongRad - firstLongRad;
	var cdelta = Math.cos(delta);
	var sdelta = Math.sin(delta);

	var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
	var x = sl1 * sl2 + cl1 * cl2 * cdelta;
	var ad = Math.atan2(y, x);
	var dist = ad * rad;

	return dist;
  }

  this.getOptimalWay = function(ways) {
	var self = this;
	var optimalWay = {
	  way: [],
	  distance: 0
	};

	if (!Array.isArray(ways)) {
	  return 'Mistake - ways must be an array';
	}

	for (var i = ways.length; i !== 0; i--) {
	  var totalDistance = self.getWayDistance(ways[i-1]);

	  if (!optimalWay.distance || totalDistance < optimalWay.distance) {
		optimalWay.distance = totalDistance;
		optimalWay.way = ways[i-1];
	  }
	}

	return optimalWay;
  };

  this.getWayDistance = function(way) {
	var self = this;
	var distances = [];

	if (!Array.isArray(way)) {
	  return 'Mistake - way must be an array';
	}

	for (var i = way.length; i !== 0; i--) {
	  if (i !== way.length) {
		distances.push(self.getDistance(way[i-1], way[i]));
	  }
	}

	return distances.reduce(function(sum, current) {
	  return sum + current;
	});
  }

  this.makeMePleasured = function(array) {
	return this.getOptimalWay(this.getWays(array));
  }
};

if (!Array.prototype.last) {
  Array.prototype.last = function() {
	return this[this.length - 1];
  }
}

/** Using functions one after another */
var distanceBuilder = new DistanceBuilder();
// var ways = distanceBuilder.getWays(arr);
// console.log(distanceBuilder.getOptimalWay(ways));
//
// /** Whole answer */
// console.log(distanceBuilder.makeMePleasured(arr));


/** Benchmark */
var start = Date.now();
var end;
var total;

for (var i = 0; i < 11; i++) {
  distanceBuilder.makeMePleasured(arr);
}
end = Date.now();

console.log(((end - start) / 10) + 'ms');

/** 7 points = 1.2 sec */