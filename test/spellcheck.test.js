const { spell } = require('../plugins/spellcheck');
const { isMisspelled } = require('spellchecker');

jest.mock('spellchecker');

afterEach(() => {
  jest.clearAllMocks();
});
describe('spellcheck spell function', () => {
  const replyThreadMock = jest.fn();
  it('should call isMisspelled, getCorrectionsForMisspelling with the passed word, and return that the value is spelled correctly', () => {
    const isMisspelledMock = jest.fn().mockReturnValue(false);
    const getCorrectionsForMisspellingMock = jest.fn();
    require('spellchecker').isMisspelled = isMisspelledMock;
    require('spellchecker').getCorrectionsForMisspelling = getCorrectionsForMisspellingMock;

    const message = {
      type: 'message',
      text: 'daylight(sp?) savings',
      reply_thread: replyThreadMock
    };
    const word = 'daylight';
    spell(message, word);
    expect(isMisspelledMock).toHaveBeenCalledWith(word);
    expect(getCorrectionsForMisspellingMock).toHaveBeenCalledWith(word);
    expect(replyThreadMock).toHaveBeenCalledWith(
      'daylight is spelled correctly.'
    );
  });

  it('should return I dont know how to fix word', () => {
    const isMisspelledMock = jest.fn().mockReturnValue(true);
    const getCorrectionsForMisspellingMock = jest.fn().mockReturnValue([]);
    require('spellchecker').isMisspelled = isMisspelledMock;
    require('spellchecker').getCorrectionsForMisspelling = getCorrectionsForMisspellingMock;

    const message = {
      type: 'message',
      text: 'daylight(sp?) savings',
      reply_thread: replyThreadMock
    };
    const word = 'daylightblabla';
    spell(message, word);
    expect(replyThreadMock).toHaveBeenCalledWith(
      "I don't know how to fix daylightblabla"
    );
  });

  it('should return possible spelling for word', () => {
    const isMisspelledMock = jest.fn().mockReturnValue(true);
    const getCorrectionsForMisspellingMock = jest
      .fn()
      .mockReturnValue(['daylight', 'day-light']);
    require('spellchecker').isMisspelled = isMisspelledMock;
    require('spellchecker').getCorrectionsForMisspelling = getCorrectionsForMisspellingMock;

    const message = {
      type: 'message',
      text: 'daylight(sp?) savings',
      reply_thread: replyThreadMock
    };
    const word = 'daylightblabla';
    spell(message, word);
    expect(replyThreadMock).toHaveBeenCalledWith(
      'possible spelling for daylightblabla: daylight, day-light'
    );
  });
});
