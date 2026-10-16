import { firstName, greetingTemplate } from '../greeting';

const at = (hour: number) => new Date(2026, 9, 12, hour, 30);

describe('greetingTemplate', () => {
  it('follows the time of day', () => {
    expect(greetingTemplate('Nimal Perera', at(7))).toBe('Good morning, {name}');
    expect(greetingTemplate('Nimal Perera', at(12))).toBe('Good afternoon, {name}');
    expect(greetingTemplate('Nimal Perera', at(17))).toBe('Good afternoon, {name}');
    expect(greetingTemplate('Nimal Perera', at(18))).toBe('Good evening, {name}');
    expect(greetingTemplate('Nimal Perera', at(0))).toBe('Good morning, {name}');
  });

  it('leaves the name out when there is none', () => {
    expect(greetingTemplate(undefined, at(9))).toBe('Good morning');
    expect(greetingTemplate('   ', at(20))).toBe('Good evening');
  });
});

describe('firstName', () => {
  it('takes the first word', () => {
    expect(firstName('  Nimal   Perera ')).toBe('Nimal');
    expect(firstName('Aisha')).toBe('Aisha');
    expect(firstName(null)).toBe('');
  });
});
