const sentiment = require('../plugins/sentiment')

jest.mock('node-fetch')

afterEach(() => {
  jest.clearAllMocks()
})

describe('findUser function', () => {
  const list = jest.fn().mockReturnValue({
    members: [
      {
        profile: {
          display_name: 'bosta'
        }
      },
      {
        profile: {
          display_name: 'John'
        }
      }
    ]
  })

  const users = { list }
  it('should call the list function on the passed users object', async () => {
    const returnedUser = await sentiment.findUser(users, 'John')
    expect(list).toHaveBeenCalled()
    expect(returnedUser).toEqual({
      profile: {
        display_name: 'John'
      }
    })
  })
  it('should return undefined when the user is not found', async () => {
    const returnedUser = await sentiment.findUser(users, 'Jane')
    expect(list).toHaveBeenCalled()
    expect(returnedUser).toBe(undefined)
  })
})

describe('getTrargetChannel function', () => {
  const list = jest.fn().mockReturnValue({
    channels: [
      {
        id: '1234',
        is_archived: false
      },
      {
        id: '5677',
        is_archived: false
      },
      {
        id: '9999',
        is_archived: true
      }
    ]
  })

  const conversations = { list }
  it('should call the list function on the passed conversations object', async () => {
    const returnedChannel = await sentiment.getTargetChannel(conversations, '5677')
    expect(list).toHaveBeenCalled()
    expect(returnedChannel).toEqual({
      id: '5677',
      is_archived: false
    })
  })
  it('should return undefined when searching for an archived channel', async () => {
    const returnedChannel = await sentiment.getTargetChannel(conversations, '9999')
    expect(list).toHaveBeenCalled()
    expect(returnedChannel).toBe(undefined)
  })
  it('should return undefined when no channel is found', async () => {
    const returnedChannel = await sentiment.getTargetChannel(conversations, '3333')
    expect(list).toHaveBeenCalled()
    expect(returnedChannel).toBe(undefined)
  })
})

describe('getUserMessagesInChannel function', () => {
  const history = jest.fn().mockReturnValue({
    messages: [
      {
        user: '1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      }
    ]
  })

  const conversations = { history }

  it('should call the history function on the passed on the conversations object', async () => {
    const returnedMessages = await sentiment.getUserMessagesInChannel(conversations, { id: '1234' }, { id: 'user1' })
    expect(history).toHaveBeenCalled()
    expect(returnedMessages).toEqual([
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      },
      {
        user: 'user1'
      }
    ])
  })
  it('should return empty array when no messages are found for the user', async () => {
    const returnedMessages = await sentiment.getUserMessagesInChannel(conversations, { id: '1234' }, { id: 'user2' })
    expect(history).toHaveBeenCalled()
    expect(returnedMessages).toEqual([])
  })
})

describe('analyseSentiment function', () => {
  const json = jest.fn()
  const fetch = require('node-fetch').mockImplementation(
    () => {
      return {
        json
      }
    }
  )
  it('should call the fetch and json functions', async () => {
    const returnedMessages = await sentiment.analyseSentiment('message 1 \n message 2')
    expect(fetch).toHaveBeenCalled()
    expect(json).toHaveBeenCalled()
  })
})

describe('analyse function', () => {
  const reply_thread = jest.fn()
  const message = {
    reply_thread,
    channel: '1234'
  }

  it('should reply that the name passed does not belong to a user', async () => {
    const list = jest.fn().mockReturnValue({
        members: []
      })
    
      const options = {
          web : {
            users: { list }
          }
      }

    const analyseResult = await sentiment.analyse(options, message, 'John')
    expect(reply_thread).toHaveBeenCalledWith(`I don't know of a John. Please validate you entered the correct person's name.`)
  })

  it('should reply that the channel or group is invalid', async () => {
    const listUsers = jest.fn().mockReturnValue({
        members: [
            {
              profile: {
                display_name: 'bosta'
              }
            },
            {
              profile: {
                display_name: 'John'
              }
            }
          ]
      })

      const listChannels = jest.fn().mockReturnValue({
        channels: []
      })
    
      
      const options = {
          web : {
              users: { list: listUsers },
              conversations: { list: listChannels }
          }
      }

    const analyseResult = await sentiment.analyse(options, message, 'John')
    expect(reply_thread).toHaveBeenCalledWith(`Are you in a channel or group? sentiment doesn\'t work in a direct message.`)
  })

  it('should reply that the person has not spoken recently', async () => {
    const listUsers = jest.fn().mockReturnValue({
        members: [
            {
              profile: {
                display_name: 'bosta'
              }
            },
            {
              profile: {
                display_name: 'John'
              }
            }
          ]
      })

      const listChannels = jest.fn().mockReturnValue({
        channels: [
            {
              id: '1234',
              is_archived: false
            },
            {
              id: '5677',
              is_archived: false
            },
            {
              id: '9999',
              is_archived: true
            }
          ]
      })

      const history = jest.fn().mockReturnValue({
        messages: []
      })   
      
      const options = {
          web : {
              users: { list: listUsers },
              conversations: { list: listChannels, history }
          }
      }

    const analyseResult = await sentiment.analyse(options, message, 'John')
    expect(reply_thread).toHaveBeenCalledWith(`User John has not spoken recently.`)
  })

  it('should call the sentiments api and return a proper sentiment result', async () => {
    const listUsers = jest.fn().mockReturnValue({
        members: [
            {
              profile: {
                display_name: 'bosta'
              }
            },
            {
                id: 'user1',
              profile: {
                display_name: 'John',
              }
            }
          ]
      })

      const listChannels = jest.fn().mockReturnValue({
        channels: [
            {
              id: '1234',
              is_archived: false
            },
            {
              id: '5677',
              is_archived: false
            },
            {
              id: '9999',
              is_archived: true
            }
          ]
      })

      const history = jest.fn().mockReturnValue({
        messages: [
            {
                user: '1'
              },
              {
                user: 'user1'
              },
              {
                user: 'user1'
              },
              {
                user: 'user1'
              },
              {
                user: 'user1'
              },
              {
                user: 'user1'
              },
              {
                user: 'user1'
              },
              {
                user: 'user1'
              },
              {
                user: 'user1'
              },
              {
                user: 'user1'
              },
              {
                user: 'user1'
              },
              {
                user: 'user1'
              }
        ]
      })   
      
      const options = {
          web : {
              users: { list: listUsers },
              conversations: { list: listChannels, history }
          }
      }

      const json = jest.fn().mockReturnValue({output: {result: 'positive'}})
      const fetch = require('node-fetch').mockImplementation(
        () => {
          return {
            json
          }
        }
      )

    const analyseResult = await sentiment.analyse(options, message, 'John')
    expect(reply_thread).toHaveBeenCalledWith(`John has recently been positive.`)
  })
})
