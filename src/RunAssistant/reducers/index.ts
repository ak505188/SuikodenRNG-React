import { EnemyGroupData, Fight } from '../../lib/interfaces';
import { RunAssistState as State } from '../interfaces';
import { handleActions } from 'redux-actions';

const initialState: State = {
  currentArea: 0,
  areas: [],
  fightsList: [],
  index: 0,
};

function calcFightIndexAfterRNGChange(fights: Fight[], index: number): number {
  for (let i = 0; i < fights.length; i++) {
    if (fights[i].index > index) {
      return i;
    }
  }
  return fights.length - 1;
}

export default handleActions(
  {
    SWITCH_AREA: (state: State, action) => {
      const currentArea: number = state.areas.map(area => area.name).findIndex(name => action.area === name);
      const rngIndex = getCurrentFight(state).index;
      if (currentArea === -1) {
        return state;
      }

      let index = state.index;
      // Decrement index until rng is lower than current
      while (state.fightsList[currentArea][index].index > rngIndex) {
        index--;
      }

      // Then increment index until rng is 1 higher than current
      while (state.fightsList[currentArea][index].index < rngIndex) {
        index++;
      }

      return {
        ...state,
        currentArea,
        index
      };
    },
    PREVIOUS_FIGHT: (state: State, action) => {
      if (state.index !== 0) {
        return {
          ...state,
          index: state.index - 1
        };
      }
      return state;
    },
    NEXT_FIGHT: (state, action) => {
      if (state.index < getCurrentFights(state).length - 1) {
        return {
          ...state,
          index: state.index + 1
        };
      }
      return state;
    },
    SELECT_FIGHT: (state, action) => {
      if (action.index < getCurrentFights(state).length - 1) {
        return {
          ...state,
          index: action.index
        };
      }
      return state;
    },
    FIND_FIGHT: (state, action) => {
      let index = findFight(state, action.name);
      index = index !== -1 ? index : state.index;
      return {
        ...state,
        index
      };
    },
    JUMP_RNG: (state, action) => {
      const fights: Fight[] = getCurrentFights(state);
      const index = calcFightIndexAfterRNGChange(fights, getCurrentFight(state).index + action.jump);
      return {
        ...state,
        index
      };
    }
  },
  initialState);

export function getCurrentArea(state: State): { name: string, enemies: EnemyGroupData[] } {
  return state.areas[state.currentArea];
}

export function getCurrentEnemies(state: State): EnemyGroupData[] {
  return getCurrentArea(state).enemies;
}

export function getCurrentFight(state: State): Fight {
  return state.fightsList[state.currentArea][state.index];
}

export function getCurrentFights(state: State): Fight[] {
  return state.fightsList[state.currentArea];
}

export function getFight(state: State, index: number): Fight {
  return getCurrentFights(state)[index];
}

// Returns index of next fight of an enemy group
export function findFight(state: State, enemyGroup: string): number {
  return getCurrentFights(state).findIndex((fight, index) => {
    return (fight.enemyGroup.name === enemyGroup && index > state.index);
  });
}

// Returns index of next fight with current enemyGroup
export function findNextFight(state: State): number {
  const name: string = getCurrentFight(state).enemyGroup.name;
  return findFight(state, name);
}
