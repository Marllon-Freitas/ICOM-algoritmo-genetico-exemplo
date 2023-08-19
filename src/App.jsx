import { useState, useEffect, useCallback } from 'react';
import './App.css';

// Gera uma população aleatória de indivíduos (strings)
function generatePopulation(size, targetLength) {
  const population = [];
  // Gera uma string aleatória de tamanho targetLength
  for (let i = 0; i < size; i++) {
    let individual = '';
    for (let j = 0; j < targetLength; j++) {
      // Gera um caractere aleatório entre 'a' e 'z'
      const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
      individual += randomChar;
    }
    population.push(individual);
  }
  return population;
}

// Calcula o fitness de um indivíduo (número de caracteres corretos)
function calculateFitness(individual, target) {
  let fitness = 0;
  // Compara cada caractere do indivíduo com o caractere correspondente da string alvo
  for (let i = 0; i < target.length; i++) {
    // Se o caractere for igual, incrementa o fitness
    if (individual[i] === target[i]) {
      fitness++;
    }
  }
  // Retorna o fitness
  return fitness;
}

// seleciona um indivíduo da população de acordo com o fitness
function select(population, fitnessScores) {
  // Calcula o fitness total da população
  const totalFitness = fitnessScores.reduce((acc, score) => acc + score, 0);
  // Gera um número aleatório entre 0 e o fitness total
  const randomValue = Math.random() * totalFitness;
  let sum = 0;
  // Percorre a população e retorna o primeiro indivíduo cuja soma do fitness com os indivíduos anteriores seja maior que o número aleatório
  for (let i = 0; i < population.length; i++) {
    sum += fitnessScores[i];
    // Se a soma for maior que o número aleatório, retorna o indivíduo
    if (sum > randomValue) {
      return population[i];
    }
  }
}

// Realiza o crossover entre dois indivíduos (strings) e retorna os dois filhos
function crossover(parent1, parent2) {
  // Seleciona um ponto de corte aleatório
  const splitPoint = Math.floor(Math.random() * parent1.length);
  // Realiza o crossover e retorna os filhos gerados
  const child1 = parent1.slice(0, splitPoint) + parent2.slice(splitPoint);
  const child2 = parent2.slice(0, splitPoint) + parent1.slice(splitPoint);
  // Retorna os filhos
  return [child1, child2];
}

// Realiza a mutação de um indivíduo (string) e retorna o indivíduo mutado
function mutate(individual, mutationRate) {
  let mutated = '';
  // Percorre o indivíduo e realiza a mutação de cada caractere com probabilidade mutationRate
  for (let i = 0; i < individual.length; i++) {
    // Gera um número aleatório entre 0 e 1
    if (Math.random() < mutationRate) {
      // Gera um caractere aleatório entre 'a' e 'z'
      mutated += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    } else {
      // Mantém o caractere original
      mutated += individual[i];
    }
  }
  return mutated;
}

function App() {
  const [targetString, setTargetString] = useState('testestr');
  const [populationSize, setPopulationSize] = useState(100);
  const [mutationRate, setMutationRate] = useState(0.1);

  const [generation, setGeneration] = useState(1);
  const [population, setPopulation] = useState([]);
  const [bestIndividual, setBestIndividual] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isInputValid, setIsInputValid] = useState(true);

  useEffect(() => {
    // Gera uma população inicial aleatória
    const initialPopulation = generatePopulation(populationSize, targetString.length);
    setPopulation(initialPopulation);
  }, [populationSize, targetString]);

  useEffect(() => {
    if (population.length > 0) {
      // Calcula o fitness de cada indivíduo da população
      const fitnessScores = population.map(individual => calculateFitness(individual, targetString));
      // Encontra o indivíduo com o maior fitness
      const maxFitness = Math.max(...fitnessScores);
      // Encontra o índice do indivíduo com o maior fitness
      const bestIndividualIndex = fitnessScores.indexOf(maxFitness);
      if(population[bestIndividualIndex] === targetString){
        setIsSimulating(false);
      }
      // Atualiza o melhor indivíduo
      setBestIndividual(population[bestIndividualIndex]);
    }
  }, [population, targetString]);

  // Função que evolui a população para a próxima geração
  const evolveNextGeneration = useCallback(() => {
    // Calcula o fitness de cada indivíduo da população
    const fitnessScores = population.map(individual => calculateFitness(individual, targetString));
    // Seleciona os pais para o crossover
    const parents = [];
    // Seleciona metade da população para serem os pais
    for (let i = 0; i < populationSize / 2; i++) {
      // Seleciona dois pais aleatórios
      const parent1 = select(population, fitnessScores);
      const parent2 = select(population, fitnessScores);
      parents.push([parent1, parent2]);
    }

    // Realiza o crossover entre os pais e gera os filhos
    const newPopulation = [];
    // Percorre os pares de pais e realiza o crossover
    for (const [parent1, parent2] of parents) {
      const [child1, child2] = crossover(parent1, parent2);
      // Adiciona os filhos à nova população após realizar a mutação com probabilidade mutationRate
      newPopulation.push(mutate(child1, mutationRate));
      newPopulation.push(mutate(child2, mutationRate));
    }

    // Encontra o índice do melhor indivíduo
    const bestIndividualIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
    // Atualiza o melhor indivíduo
    setBestIndividual(newPopulation[bestIndividualIndex]);

    // Atualiza a população
    setPopulation(newPopulation);
    // Incrementa o número da geração
    setGeneration(prevGeneration => prevGeneration + 1);

    // Verifica se o melhor indivíduo é igual ao target string e para a simulação
    if (newPopulation[bestIndividualIndex] === targetString) {
      setIsSimulating(false);
    }
  }, [mutationRate, population, populationSize, targetString]);

  useEffect(() => {
    if (isSimulating) {
      const timer = setInterval(evolveNextGeneration, 200); // Delay between generations (milliseconds)
      return () => clearInterval(timer);
    }
  }, [evolveNextGeneration, isSimulating]);

  const handleTargetStringChange = event => {
    // Remover caracteres não alfabéticos e letras maiúsculas
    const newTargetString = event.target.value.replace(/[^a-z]/gi, '').toLowerCase();
    setTargetString(newTargetString);
    setIsInputValid(newTargetString.trim() !== '' && populationSize > 0);
  };

  const handlePopulationSizeChange = event => {
    const newPopulationSize = parseInt(event.target.value);
    setPopulationSize(newPopulationSize);
    setIsInputValid(targetString.trim() !== '' && newPopulationSize > 0);
  };

  const handleMutationRateChange = event => {
    const newMutationRate = parseFloat(event.target.value);
    setMutationRate(newMutationRate);
  };
  

  const startSimulation = () => {
    if (isInputValid) { // Verifica se o input é válido
      setGeneration(1);
      setBestIndividual('');
      setIsSimulating(true);
      const initialPopulation = generatePopulation(populationSize, targetString.length);
      setPopulation(initialPopulation);
    }
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  return (
    <div className="App">
      <h1>
        Exemplo de Algoritmo Genético
      </h1>
     <div className="gn-wrapper">
        <div className="settings">
        <h2>Configurações:</h2>
          <div className="settings-inputs">
            <div className="targetStringContainer">	
              <label>Target String:</label>
              <input
                type="text"
                className={`targetString ${!isInputValid ? 'invalid' : ''}`}
                value={targetString}
                onChange={handleTargetStringChange}
              />
            </div>
            <div className="populationSizeContainer">
              <label>
                Tamanho da População:
              </label>
              <input
                type="number"
                min={1}
                className={`populationSize ${!isInputValid ? 'invalid' : ''}`}
                value={populationSize}
                onChange={handlePopulationSizeChange}
              />
            </div>
            <div className="mutationRateContainer">
              <label>Taxa de Mutação:</label>
                <input
                  type="range"
                  className="slider"
                  min="0"
                  max="1"
                  step="0.01"
                  value={mutationRate}
                  onChange={handleMutationRateChange}
                />
                <span>
                  {
                    `${(mutationRate * 100).toFixed(0)}%` /* Mostra o valor atual do slider em % */
                  }</span>
            </div>
          </div>
        </div>
        <div className="information">
          <div className="generation">Geração: {generation}</div>
          <div className="target">String Objetivo: {targetString}</div>
          <div className="best-individuo">Melhor Indivíduo: {bestIndividual}</div>
        </div>
        <button
          className={
            `startSimulationButton ${!isInputValid ? 'invalid' : ''}`
          }
          disabled={!isInputValid} 
          onClick={
            !isSimulating ? startSimulation : stopSimulation
          }>
            {isSimulating ? 'Parar Simulação' : 'Iniciar Simulação'}
        </button>
        <h2>
          População:
        </h2>
        <div className="population">
          {population.map((individual, index) => (
            <div key={index} className="individual">
              {individual}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
