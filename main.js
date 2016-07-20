/**
 * Created by linkfly on 20.07.16.
 */
(() => {
  'use strict';
  let NeuronBase = function(weights) {
    this.weights = weights;
    this.inputLinks = [];
    this.output = 0;
  };
  NeuronBase.prototype = {
    fn: function(inputs) {
      /*let res = new Array(inputs.length);*/
      let res = 0;
      inputs.forEach((sig, idx) => {
        res += this.weights[idx] * sig;
      });
      this.output = res >= 0 ? 1 : -1;
      return this.output;
    }
  };

  let NeuroNetBase = function(NeuronConstructor, arWeights) {
    let n = arWeights.length;
    this.neurons = new Array(n);
    while(n--) {
      this.neurons[n] = new NeuronConstructor(arWeights[n]);
    }
    // Соединяем вход каждого нейрона с выходами других нейронов
    this.neurons.forEach((neuron, idx) => {
      let neuronsForConnect = [];
      this.neurons.forEach((neuron2, idx2) => {
        if (idx !== idx2)
          neuronsForConnect.push(neuron2);
      });
      neuron.inputLinks = neuronsForConnect;
    });
  };
  NeuroNetBase.prototype = {
    run(arInputs, nIterations) {
      let handleNeurons = () => {
        this.neurons.forEach((neuron, idx) => {
          let inputs = [];
          neuron.inputLinks.forEach((neuron) => inputs.push(neuron.output));
          inputs.unshift(arInputs[idx]);
          neuron.fn(inputs);
        });
      };
      let curY = 0;
      let correctInputs = () => {
        curY %= arInputs.length;
        arInputs[curY] = this.neurons[curY].output;
      };
      while(nIterations--) {
        handleNeurons();
        correctInputs();
      }
      return this.neurons.map((neuron) => {
        return neuron.output;
      });
    }
  };

  let pats = [
    [-1,1,-1,1],
    [1,-1,1,1],
    [-1,1,-1,-1]
    ];
  //////// Вычисляем E(X_i * X_i_t) - сумму матриц полученных умножением вектора X на транспонированный вектор X ////////
  // Вычисляем матрицы получаемые умножением вектора X на транспонированный вектор X
  let mats = [];
  pats.forEach((pat) => {
    let mat = [];
    pat.forEach((n) => {
      let line = [];
      pat.forEach((n2) => {
        line.push(n * n2);
      });
      mat.push(line);
    });
    mats.push(mat);
  });
  let len = mats.length;
  // Складываем матрицы и получаем веса
  let weights = new Array(len);
  let vlen = mats[0][0].length;
  for(let i = 0; i < vlen; i++) {
    var line = new Array(len);
    weights[i] = (line);
    for(let j = 0; j < vlen; j++) {
      line[j] = 0;
      if (!(i == j))
        for(let k = 0; k < len; k++) {
          line[j] += mats[k][i][j];
        }
    }
  }
  console.log(weights);
  var i = 1;
  //while(i <= 5) {
  {
    //i++;
    let net = new NeuroNetBase(NeuronBase, weights);
    /*let res = net.run([1, -1, 1, 1], 1);*/
    let res = net.run([1, -1, 1, 1], 1001);
    console.log(res);
  }
})();