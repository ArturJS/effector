import {forward} from 'effector';

import {
  changeSources,
  realmEvent,
  realmStore,
  realmInvoke,
  resetGraphiteState,
  evalEffect,
  EvalRealm,
  sourceCode,
  graphite,
  graphiteCode,
  codeError,
  realmLog,
  logs,
  realmStatus,
  stats,
} from './domain';

import {switcher} from './switcher';
import {evaluator} from './evaluator';
import {printLogs} from './logs';

logs.watch(realmLog, (logs, log) => {
  logs.push(log);
});
logs.watch(realmStatus, (logs, {active}) => {
  if (!active) {
    printLogs(logs);
  }
  logs.length = 0;
});

stats
  .on(realmEvent, ({event, store}, e) => ({
    event: [...event, e],
    store,
  }))
  .on(realmStore, ({event, store}, e) => ({
    event,
    store: [...store, e],
  }))
  .on(realmStatus, (stats, {active}) => {
    if (!active) return stats;
    return {
      store: [],
      event: [],
    };
  });

stats.watch(e => {
  //console.log('stats', e);
});

forward({
  from: evalEffect,
  to: resetGraphiteState,
});
evalEffect.use(evaluator);

const graphiteInvokeSetter = (state, event) => {
  let result;
  if (state.__shouldReset === true) result = {};
  else result = {...state};
  result[`${event.kind} '${event.shortName}'`] = event.graphite.seq;
  return result;
};

graphite
  .on(realmEvent, graphiteInvokeSetter)
  .on(realmStore, graphiteInvokeSetter)
  .on(resetGraphiteState, e => {
    e.__shouldReset = true;
    return e;
  });

switcher({
  event: realmInvoke,
  selector: {
    realmEvent: obj => obj.kind === 'event',
    realmStore: obj => obj.kind === 'store',
  },
  pre: {
    realmEvent: data => data.instance || {},
    realmStore: data => data.instance || {},
  },
  post: {
    realmEvent,
    realmStore,
  },
});

// realmInvoke.watch(e => console.log('realm invoke', e));
// realmEvent.watch(e => console.log('realm event', e.shortName));
// realmStore.watch(e => console.log('realm store', e.shortName));

codeError
  .on(evalEffect.done, () => ({
    isError: false,
    message: null,
    stack: null,
  }))
  .on(evalEffect.fail, (_, e) => ({
    isError: true,
    message: e.error.message,
    stack: e.error.stack,
  }));

forward({
  from: changeSources,
  to: sourceCode,
});
sourceCode.watch(e => evalEffect(e));
