/* eslint-disable @typescript-eslint/no-explicit-any */
import * as jestGlobals from '@jest/globals';
import * as acorn from 'acorn';

type Fn = (...args: any[]) => any;

const globalFixtures = new Map<string, Fn>();

export function test(name: string, fn: Fn): void {
  jestGlobals.test(name, async () => {
    const scopeFixtures = new Map<string, any>();

    const injectedFn = inject(fn, scopeFixtures);

    await injectedFn();
  });
}

interface ParametrizeConfig {
  paramNames: string[];
  testCases: unknown[][];
  ids: string[];
}

export function parametrizeTest(
  config: ParametrizeConfig,
  name: string,
  fn: Fn
): void {
  for (const [testCaseIndex, testCase] of config.testCases.entries()) {
    const testCaseName = config.ids[testCaseIndex];

    jestGlobals.test(`${name} [${testCaseName}]`, async () => {
      const scopeFixtures = new Map<string, any>();

      for (const [paramIndex, paramName] of config.paramNames.entries()) {
        scopeFixtures.set(paramName, testCase[paramIndex]);
      }

      const injectedFn = inject(fn, scopeFixtures);

      await injectedFn();
    });
  }
}

/* A decrator */
export function fixture(
  target: unknown,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<any>
): void {
  register(descriptor.value);

  return;
}

function register(fixture: Fn): void {
  if (globalFixtures.has(fixture.name)) {
    throw new Error(
      `Fixture ${fixture.name} already registered, what's going on?`
    );
  }

  globalFixtures.set(fixture.name, fixture);
}

function getParams(fn: Fn): string[] {
  let parsed: any;
  try {
    parsed = acorn.parse(fn.toString(), { ecmaVersion: 2021 });

    return parsed.body[0].params.map((node: any) => node.name);
  } catch (error) {
    //
  }

  try {
    parsed = acorn.parse(fn.toString(), { ecmaVersion: 2021 });
    return parsed.body[0].expression.params.map((node: any) => node.name);
  } catch (error) {
    //
  }

  try {
    parsed = acorn.parse(`class Fixtures { ${fn.toString()} }`, { ecmaVersion: 2021 });
    return parsed.body[0].body.body[0].value.params.map(
      (node: any) => node.name
    );
  } catch (error) {
    //
  }

  throw new Error(`Failed to understand method ${fn}`);
}

function inject(fn: Fn, scopeFixtures: Map<string, any>): Fn {
  const fixtures = getParams(fn);

  const realFixtures: any[] = [];
  for (const fixture of fixtures) {
    const existingFixture = scopeFixtures.get(fixture);

    if (existingFixture !== undefined) {
      realFixtures.push(existingFixture);

      continue;
    }

    const realFixture = globalFixtures.get(fixture);

    if (realFixture === undefined) {
      throw new Error(`Fixture ${fixture} not defined!`);
    }

    if (globalFixtures.has(fixture)) {
      const newFixture = inject(realFixture, scopeFixtures)();

      scopeFixtures.set(fixture, newFixture);
      realFixtures.push(newFixture);
    } else {
      const newFixture = realFixture();

      realFixtures.push(newFixture);
    }
  }

  return (...args: any[]) => fn(...realFixtures, ...args);
}
