// backend/utils/eventEmitter.js

import EventEmitter from "events"; // Thay require('events') bằng import nếu cần
const emitter = new EventEmitter();

// Sử dụng export default để khớp với import appEvents from "..."
export default emitter;
