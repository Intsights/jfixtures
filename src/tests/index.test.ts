import * as jestFixtures from '..';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Fixtures {
    @jestFixtures.fixture
    dateMock(): Date {
        return new Date(100);
    }
}

describe('Test test', () => {
    jestFixtures.test('When has dependencies => test properly', (dateMock: Date) => {
        expect(dateMock).toEqual(new Date(100));
    });

    jestFixtures.parametrizeTest(
        {
            paramNames: ['testValue', 'expectedValue'],
            testCases: [
                [1, 2],
                [3, 4],
            ],
            ids: ['1+1=2', '3+1=4'],
        },
        'When params => test properly',
        (testValue: number, expectedValue: number) => {
            expect(testValue + 1).toEqual(expectedValue);
        },
    );
});
