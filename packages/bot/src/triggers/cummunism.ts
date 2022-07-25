import {emojis} from '../constants.js'
import type {Trigger} from '../types'

const trigger: Trigger = {
	regex: /cummunis(?:m|t)/iu,
	message: `Noot noot ${emojis.smirk}`
}
export default trigger
