local STOPPED=0
local UP = 1
local DOWN=2
local LEFT=3
local RIGHT=4

local Directions = {
    STOPPED = 0,
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4,
}

local HeadChar = {
    [UP] = '^',
    [DOWN] = 'v',
    [LEFT] = '<',
    [RIGHT] = '>',
    [STOPPED] = 'X',
}

local KeyDirMap = {
    h = LEFT,
    j = DOWN,
    k = UP,
    l = RIGHT
}

return {
    Directions = Directions,
    HeadChar = HeadChar,
    KeyDirMap = KeyDirMap,
    BodyChar = '*',
    FoodChar = 'O',
    GridChar = '.',
}
