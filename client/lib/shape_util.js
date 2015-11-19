shapeUtil = {
  linearRegression: (x, y) => {
      let lr = {}, n = y.length;
      let sum_x = 0, sum_y = 0, sum_xy = 0,
          sum_xx = 0, sum_yy = 0;

      for (let i = 0; i < y.length; i++) {
          sum_x += x[i];
          sum_y += y[i];
          sum_xy += (x[i] * y[i]);
          sum_xx += (x[i] * x[i]);
          sum_yy += (y[i] * y[i]);
      }

      lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
      lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
      lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);
      return lr;
  },

  douglasPeucker: (points, tolerance) => {
      console.log(points.length);
      if (points.length <= 2) {
          return [points[0]];
      }
      var returnPoints = [],
          // make line from start to end
          line = new Line(points[0], points[points.length - 1]),

          // find the largest distance from intermediate poitns to this line
          maxDistance = 0,
          maxDistanceIndex = 0,
          p;
      //      console.log('making line between ' +  points[0].x + ','+points[0].y + ' and ' + points[points.length - 1].x + ','+points[points.length-1].y)
      for (var i = 1; i <= points.length - 2; i++) {
          var distance = line.distanceToPoint(points[i]);
          //      console.log('considering...', points[i].x, points[i].y)
          if (distance > maxDistance) {
              maxDistance = distance;
              maxDistanceIndex = i;
          }
      }

      // console.log('tolerance:', tolerance)
      // console.log('maxDist:', maxDistance)
      // console.log('maxDistIndex:', maxDistanceIndex)

      // check if the max distance is greater than our tollerance allows
      if (maxDistance >= tolerance) {
          p = points[maxDistanceIndex];
          // console.log('including... ', maxDistanceIndex)
          line.distanceToPoint(p, true);
          // include this point in the output
          // console.log('calling with 0 to ', (maxDistanceIndex))
          returnPoints = returnPoints.concat(shapeUtil.douglasPeucker(points.slice(0, maxDistanceIndex + 1), tolerance));
          // returnPoints.push( points[maxDistanceIndex] );
          // console.log('calling with  ', (maxDistanceIndex), ' to ', (points.length - 1))
          returnPoints = returnPoints.concat(shapeUtil.douglasPeucker(points.slice(maxDistanceIndex, points.length), tolerance));
      } else {
          // ditching this point
          p = points[maxDistanceIndex];
          // console.log('ditching ' + maxDistanceIndex + ': ' + p.x + ', ' + p.y)
          line.distanceToPoint(p, true);
          returnPoints = [points[0]];
      }
      // console.log('returnPoints: ');
      // console.log(returnPoints);
      return returnPoints;
  }
}

let Line = function(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;

    this.distanceToPoint = function(point) {
        if (this.p1.x == this.p2.x && (this.p1.y == this.p2.y)) {
            return Math.sqrt(Math.pow((point.y - this.p1.y), 2) + Math.pow((point.x - this.p1.x), 2));
        }

        // slope
        var m = (this.p2.x - this.p1.x) / (this.p2.y - this.p1.y),
            // y offset
            b = this.p1.x - (m * this.p1.y),
            d = [];
        // distance to the linear equation
        d.push(Math.abs(point.x - (m * point.y) - b) / Math.sqrt(Math.pow(m, 2) + 1));
        // distance to p1
        d.push(Math.sqrt(Math.pow((point.y - this.p1.y), 2) + Math.pow((point.x - this.p1.x), 2)));
        // distance to p2
        d.push(Math.sqrt(Math.pow((point.y - this.p2.y), 2) + Math.pow((point.x - this.p2.x), 2)));
        // return the smallest distance
        return d.sort(function(a, b) {
            return (a - b); //causes an array to be sorted numerically and ascending
        })[0];
    };
};
