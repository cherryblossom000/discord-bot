import {createResolve, searchToVideo} from '../src/helpers'
import type {Video} from '../src/types'

describe('Helpers', () => {
  test('createResolve', () => expect(createResolve('dirname')('path')).toBe('dirname/path'))
  test('searchToVideo', () => expect(searchToVideo({
    type: 'video',
    title: 'title',
    description: 'description',
    url: 'url',
    videoId: 'id',
    seconds: 10,
    timestamp: '0:10',
    duration: {seconds: 10, timestamp: '0:10'},
    views: 0,
    thumbnail: 'thumbnail',
    image: 'image',
    ago: '1 minute ago',
    author: {
      name: 'author',
      id: 'author id',
      url: 'author url',
      userId: 'user id',
      userUrl: 'user url',
      userName: 'user name',
      channelId: 'channel id',
      channelUrl: 'channel url',
      channelName: 'channel name'
    }
  }))
    .toEqual<Video>({title: 'title', id: 'id', author: 'author'})
  )
})
