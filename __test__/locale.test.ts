/* eslint-env jest */
import { zhLocale, enLocale, setLocale, getLocale, getMessage } from '../src/locale';

describe(__filename, () => {
  test('getLocale', async () => {
    expect(getLocale().array_max).toEqual(enLocale.array_max);
  });

  test('setLocale', async () => {
    setLocale(zhLocale);
    expect(getLocale().array_max).toEqual(zhLocale.array_max);
    setLocale(enLocale);
  });

  test('getMessage', async () => {
    expect(getMessage('array_max')).toEqual('Length should smaller than {max}');
  });
});
