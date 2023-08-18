import { useState, useEffect, useCallback } from 'react';
import './App.css';

function generatePopulation(size, targetLength) {
  const population = [];
  for (let i = 0; i < size; i++) {
    let individual = '';
    for (let j = 0; j < targetLength; j++) {
      const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
      individual += randomChar;
    }
    population.push(individual);
  }
  return population;
}

function calculateFitness(individual, target) {
  let fitness = 0;
  for (let i = 0; i < target.length; i++) {
    if (individual[i] === target[i]) {
      fitness++;
    }
  }
  return fitness;
}

function select(population, fitnessScores) {
  const totalFitness = fitnessScores.reduce((acc, score) => acc + score, 0);
  const randomValue = Math.random() * totalFitness;
  let sum = 0;
  for (let i = 0; i < population.length; i++) {
    sum += fitnessScores[i];
    if (sum > randomValue) {
      return population[i];
    }
  }
}

function crossover(parent1, parent2) {
  const splitPoint = Math.floor(Math.random() * parent1.length);
  const child1 = parent1.slice(0, splitPoint) + parent2.slice(splitPoint);
  const child2 = parent2.slice(0, splitPoint) + parent1.slice(splitPoint);
  return [child1, child2];
}

function mutate(individual, mutationRate) {
  let mutated = '';
  for (let i = 0; i < individual.length; i++) {
    if (Math.random() < mutationRate) {
      mutated += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    } else {
      mutated += individual[i];
    }
  }
  return mutated;
}

function App() {
  const [targetString, setTargetString] = useState('testestr');
  const [populationSize, setPopulationSize] = useState(100);
  const mutationRate = 0.1;

  const [generation, setGeneration] = useState(1);
  const [population, setPopulation] = useState([]);
  const [bestIndividual, setBestIndividual] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isInputValid, setIsInputValid] = useState(true);

  useEffect(() => {
    const initialPopulation = generatePopulation(populationSize, targetString.length);
    setPopulation(initialPopulation);
  }, [populationSize, targetString]);

  useEffect(() => {
    if (population.length > 0) {
      const fitnessScores = population.map(individual => calculateFitness(individual, targetString));
      const maxFitness = Math.max(...fitnessScores);
      const bestIndividualIndex = fitnessScores.indexOf(maxFitness);
      if(population[bestIndividualIndex] === targetString){
        setIsSimulating(false);
      }
      setBestIndividual(population[bestIndividualIndex]);
    }
  }, [population, targetString]);

  const evolveNextGeneration = useCallback(() => {
    const fitnessScores = population.map(individual => calculateFitness(individual, targetString));

    const parents = [];
    for (let i = 0; i < populationSize / 2; i++) {
      const parent1 = select(population, fitnessScores);
      const parent2 = select(population, fitnessScores);
      parents.push([parent1, parent2]);
    }

    const newPopulation = [];
    for (const [parent1, parent2] of parents) {
      const [child1, child2] = crossover(parent1, parent2);
      newPopulation.push(mutate(child1, mutationRate));
      newPopulation.push(mutate(child2, mutationRate));
    }

    const bestIndividualIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
    setBestIndividual(newPopulation[bestIndividualIndex]);

    // Destacar as mudanças nos indivíduos
    const changedIndividuals = [];
    for (let i = 0; i < populationSize; i++) {
      if (population[i] !== newPopulation[i]) {
        changedIndividuals.push(i);
      }
    }

    setPopulation(newPopulation);
    setGeneration(prevGeneration => prevGeneration + 1);

    if (newPopulation[bestIndividualIndex] === targetString) {
      setIsSimulating(false);
    }

    // Aplicar a classe "changed" aos indivíduos alterados por 1 segundo
    changedIndividuals.forEach(index => {
      setTimeout(() => {
        const individualElements = document.querySelectorAll('.individual');
        individualElements[index].classList.add('changed');
        setTimeout(() => {
          individualElements[index].classList.remove('changed');
        }, 1000);
      }, 100);
    });
  }, [mutationRate, population, populationSize, targetString]);

  useEffect(() => {
    if (isSimulating) {
      const timer = setInterval(evolveNextGeneration, 200); // Delay between generations (milliseconds)
      return () => clearInterval(timer);
    }
  }, [evolveNextGeneration, isSimulating]);

  const handleTargetStringChange = event => {
    const newTargetString = event.target.value.replace(/[^a-zA-Z]/g, ''); // Remover caracteres não alfabéticos
    setTargetString(newTargetString);
    setIsInputValid(newTargetString.trim() !== '' && populationSize > 0);
  };

  const handlePopulationSizeChange = event => {
    const newPopulationSize = parseInt(event.target.value);
    setPopulationSize(newPopulationSize);
    setIsInputValid(targetString.trim() !== '' && newPopulationSize > 0);
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
     <div className="gn-wrapper">
      <h1>
        Exemplo de Algoritmo Genético
      </h1>
        <div className="settings">
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
        </div>
        <div className="generation">Geração: {generation}</div>
        <div className="target">String de Destino: {targetString}</div>
        <div className="best">Melhor Indivíduo: {bestIndividual}</div>
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
          População
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
