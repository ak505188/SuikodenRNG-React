import { EnemyGroupData, Fight } from '../../lib/interfaces';
import { RunAssistState as State } from '../interfaces';
import { handleActions } from 'redux-actions';

const initialState: State = {
  currentArea: 0,
  areas: [],
  fightsList: [],
  fightIndex: 0,
  rngIndex: 0
};

function calcFightIndexAfterRNGChange(fights: Fight[], rngIndex: number): number {
  for (let i = 0; i < fights.length; i++) {
    if (fights[i].index > rngIndex) {
      return i;
    }
  }
  return fights.length - 1;
}

function calcRNGIndexJump(current: number, jump: number, last: number): number {
  if (current + jump < 0) {
    return 0;
  } else if (current + jump > last) {
    return last;
  }
  return current + jump;
}

export default handleActions(
  {
    SWITCH_AREA: (state: State, action) => {
      const currentArea: number = state.areas.map(area => area.name).findIndex(name => action.area === name);
      if (currentArea === -1) {
        return state;
      }

      let fightIndex = state.fightIndex;
      // Decrement fightIndex until rng is lower than current
      while (state.fightsList[currentArea][fightIndex].index > state.rngIndex) {
        fightIndex--;
      }

      // Then increment fightIndex until rng is 1 higher than current
      while (state.fightsList[currentArea][fightIndex].index < state.rngIndex) {
        fightIndex++;
      }
      return {
        ...state,
        currentArea,
        fightIndex
      };
    },
    PREVIOUS_FIGHT: (state: State, action) => {
      if (state.fightIndex !== 0) {
        return {
          ...state,
          fightIndex: state.fightIndex - 1,
          rngIndex: getCurrentFights(state)[state.fightIndex - 1].index
        };
      }
      return state;
    },
    NEXT_FIGHT: (state, action) => {
      if (state.fightIndex < getCurrentFights(state).length - 1) {
        return {
          ...state,
          fightIndex: state.fightIndex + 1,
          rngIndex: getCurrentFights(state)[state.fightIndex + 1].index
        };
      }
      return state;
    },
    SELECT_FIGHT: (state, action) => {
      if (action.index < getCurrentFights(state).length - 1) {
        return {
          ...state,
          fightIndex: action.index,
          rngIndex: getCurrentFights(state)[action.index].index
        };
      }
      return state;
    },
    FIND_FIGHT: (state, action) => {
      let fightIndex = findFight(state, action.name);
      fightIndex = fightIndex !== -1 ? fightIndex : state.fightIndex;
      return {
        ...state,
        fightIndex,
        rngIndex: getCurrentFights(state)[fightIndex].index
      };
    },
    JUMP_RNG: (state, action) => {
      const fights: Fight[] = getCurrentFights(state);
      const rngIndex = calcRNGIndexJump(state.rngIndex, action.jump, fights[fights.length - 1].index);
      const fightIndex = calcFightIndexAfterRNGChange(fights, rngIndex);
      return {
        ...state,
        rngIndex,
        fightIndex
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
  return state.fightsList[state.currentArea][state.fightIndex];
}

export function getCurrentFights(state: State): Fight[] {
  return state.fightsList[state.currentArea];
}

export function getFight(state: State, index: number): Fight {
  return getCurrentFights(state)[index];
}

// Returns fightIndex of next fight of an enemy group
export function findFight(state: State, enemyGroup: string): number {
  return getCurrentFights(state).findIndex((fight, index) => {
    return (fight.enemyGroup.name === enemyGroup && index > state.fightIndex);
  });
}

// Returns fightIndex of next fight with current enemyGroup
export function findNextFight(state: State): number {
  const name: string = getCurrentFight(state).enemyGroup.name;
  return findFight(state, name);
}