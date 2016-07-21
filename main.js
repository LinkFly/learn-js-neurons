/**
 * Created by linkfly on 20.07.16.
 */
(function(){
  'use strict';
  let log = function() {
    console.log.apply(console, arguments);
    let html = '<br/><pre>';
    for(let i = 0; i < arguments.length; i++) {
      html += JSON.stringify(arguments[i]) + '    ';
    }
    html += '</pre>';
    document.writeln(html);
  };
  let NeuronBase = function(weights){
    /** @todo проверить будет ли возвращаемый объект через "return {...};" содержать правильный конструктор и прототип */
    this.weights = weights;
    // Сигналы полученные от других нейронов (перед прохождением через синапсы)
    this.inputLinks = [];
    // Нейроны на вход которых подаётся выход этого нейрона (нейроны на дендриты которых подаётся сигнал от аксона этого нейрона)
    this.neuronsLinks = [];
    // Сигнал в "индуцированном локальном поле"
    this.input = 0;
    // Выход на аксоне нейрона
    this.output = 0;
  };
  NeuronBase.prototype = {
    fn: function(){
      return (this.output = this.input >= 0 ? 1 : -1);
    },
    prepareInput: function(){
      let res = 0;
      this.inputLinks.forEach((sig, idx) =>{
        res += this.weights[idx] * sig;
      });
      return (this.input = res);
    }
  };

  /** @todo использовать es6 параметры по-умолчанию для fnConnect */
  /** @todo вычислять arWeights с помощью передаваемой ф-ии */
  let NeuroNetBase = function(NeuronConstructor, patts, fnConnect){
    let _this = this;
    let weights = this.getWeightsByPatts(patts);
    _this.weights =  weights;
    let n = weights.length;
    _this.patts = patts;
    _this.neurons = new Array(n);
    while(n--){
      _this.neurons[n] = new NeuronConstructor(weights[n]);
    }
    // По-умолчанию соединяем выход каждого нейрона со входами других нейронов
    fnConnect = fnConnect || ((neurons) =>{
        neurons.forEach((neuron) => neuron.neuronsLinks = neurons);
      });
    fnConnect(_this.neurons);
  };

  NeuroNetBase.prototype = {
    utils: {
      eqArs: function(ar1, ar2) {
        return ar1.every((e, i) => {
          return e == ar2[i];
        })
      }
      /*// Умножение векторов равной длины
      mulArs: function(ar1, ar2) {
        let
          len = ar1.length,
          res = new Array(len);
        for(let i = 0; i < len; i++)
          res[i] = ar1[i] * ar2[i];
        return res;
      },
    sumAr: function(ar) {
        return ar.reduce((a, b) => a + b);
      }*/
    },
    /** @todo Перенести вычисления в NeuroNetBase */
    getWeightsByPatts: (patts) => {
      //////// Вычисляем E(X_i * X_i_t) - сумму матриц полученных умножением вектора X на транспонированный вектор X ////////
      // Вычисляем матрицы получаемые умножением вектора X на транспонированный вектор X
      let mats = [];
      patts.forEach((pat) => {
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
      return weights;
    },
    run(arInputs, nIterations) {
      let
        neurons = this.neurons,
        utils = this.utils,
        eqArs = utils.eqArs;
        /*mulArs = utils.mulArs,
        sumAr = utils.sumAr;*/
      log('Patterns: ', JSON.stringify(this.patts));
      log('Weights: ', JSON.stringify(this.weights));
      log('Inputs: ', arInputs);
      // Установка выходных сигналов нейронов в соотв. с переданным вектором
      let initOutputs = () => {
        neurons.forEach((neuron, idx) => {
          neuron.output = arInputs[idx];
        });
      };
      // Посылка выходных сигналов нейронов всем нейронам, с которыми связан его выход
      let outputsToNeurons = () => {
        neurons.forEach((neuron, i) => {
          neuron.neuronsLinks.forEach((neuronLink) => {
            neuronLink.inputLinks[i] = neuron.output;
          });
        });
      };

      // Умножение вектора выходных сигналов на вектор весов для нейрона j [0..N-1], N - кол-во нейронов
      let handleInput = () => {
        neurons.forEach((neuron) => {
          neuron.prepareInput();
          neuron.fn();
        })
      };

      // Получение текущего выходного вектора
      let getOutputs = () => neurons.map((neuron) => neuron.output);
      let getInputLinks = () => neurons.map((neuron) => neuron.inputLinks);
      let getInputs = () => neurons.map((neuron) => neuron.input);

      // Проверка, соотв. ли выходной вектор одному из образцов (возвращает вектор с выходными сигналами)
      let checkOutputs = () => {
        let outputs = getOutputs();
        let res = this.patts.some((patt) => eqArs(patt, outputs));
        return res && outputs;
      };

      initOutputs();
      while(nIterations--){
        outputsToNeurons();
        log('Current inputLinks: ', JSON.stringify(getInputLinks()));
        handleInput();
        log('Current inputs: ' + getInputs());
        log('Current outputs: ' + getOutputs());
        let res;
        if(res = checkOutputs()) return res;
      }
      log('fail');
      return false;
    }
  };

  /*********** Test ************/
  let patts = [
    [-1,1,-1,1],
    [1,-1,1,1],
    [-1,1,-1,-1]
    ];
  let net = new NeuroNetBase(NeuronBase, patts);
  let res = net.run([1, -1, 1, -1], 3);
  log('Result: ', res);
})();