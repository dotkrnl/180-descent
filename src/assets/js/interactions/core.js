(function(){
  "use strict";
  window.DescentCore = {
    mean: function(values){
      return values.reduce(function(sum,value){ return sum + value; }, 0) / values.length;
    },
    variance: function(values, avg){
      return values.reduce(function(sum,value){
        var delta = value - avg;
        return sum + delta * delta;
      }, 0) / Math.max(1, values.length - 1);
    },
    erf: function(x){
      var sign = x < 0 ? -1 : 1;
      var a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
      x = Math.abs(x);
      var t = 1 / (1 + p * x);
      var y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      return sign * y;
    },
    normalCdf: function(x){
      return 0.5 * (1 + this.erf(x / Math.SQRT2));
    },
    gammaln: function(x){
      var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
      var y = x, t = x + 5.5;
      t -= (x + 0.5) * Math.log(t);
      var s = 1.000000000190015;
      for (var j = 0; j < 6; j++) { y += 1; s += c[j] / y; }
      return -t + Math.log(2.5066282746310005 * s / x);
    },
    betacf: function(a,b,x){
      var maxIterations = 200, eps = 3e-12, tiny = 1e-300;
      var qab = a + b, qap = a + 1, qam = a - 1;
      var c = 1, d = 1 - qab * x / qap;
      if (Math.abs(d) < tiny) d = tiny;
      d = 1 / d;
      var h = d;
      for (var m = 1; m <= maxIterations; m++) {
        var m2 = 2 * m;
        var aa = m * (b - m) * x / ((qam + m2) * (a + m2));
        d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
        c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
        d = 1 / d; h *= d * c;
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
        d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
        c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
        d = 1 / d; var del = d * c; h *= del;
        if (Math.abs(del - 1) < eps) break;
      }
      return h;
    },
    betai: function(a,b,x){
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var bt = Math.exp(this.gammaln(a + b) - this.gammaln(a) - this.gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
      if (x < (a + 1) / (a + b + 2)) return bt * this.betacf(a, b, x) / a;
      return 1 - bt * this.betacf(b, a, 1 - x) / b;
    },
    studentTCdf: function(t,df){
      var x = df / (df + t * t);
      var ib = this.betai(df / 2, 0.5, x);
      return t >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
    },
    tCritical: function(df, confidence){
      var tail = 0.5 + Math.max(0.5, Math.min(0.999, confidence)) / 2;
      var lo = 0, hi = 10;
      for (var i = 0; i < 50; i++) {
        var mid = (lo + hi) / 2;
        if (this.studentTCdf(mid, df) < tail) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    },
    tTestP: function(a,b){
      if (a.length < 3 || b.length < 3) return 1;
      var ma = this.mean(a), mb = this.mean(b);
      var va = this.variance(a, ma), vb = this.variance(b, mb);
      var se = Math.sqrt(va / a.length + vb / b.length);
      if (!Number.isFinite(se) || se <= 0) return 1;
      return 2 * (1 - this.normalCdf(Math.abs((ma - mb) / se)));
    },
    randn: function(){
      var u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
  };
})();
