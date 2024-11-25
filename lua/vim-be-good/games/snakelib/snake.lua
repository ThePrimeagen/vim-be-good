local Snake = {}

local C = require('vim-be-good.games.snakelib.const')
local Dir = C.Directions

local STOPPED = Dir.STOPPED
local UP = Dir.UP
local DOWN = Dir.DOWN
local LEFT = Dir.LEFT
local RIGHT = Dir.RIGHT

function Snake:new(x, y, initialSize, noWalls)
    self.__index = self
    local head = { x = math.floor(x), y = math.floor(y) }
    local newSnake = {
        dir = RIGHT,
        head = {x = math.floor(x), y = math.floor(y)},
        body = {},
        shouldGrow = false,
        dead = false,
        noWalls = noWalls,
        hitWall = false,
    }
    if initialSize and initialSize > 1 then
        local lastBodyPart = head
        for _ = 1, initialSize do
            local bodyPart = { x = lastBodyPart.x - 1, y = lastBodyPart.y }
            lastBodyPart = bodyPart
            table.insert(newSnake.body, bodyPart)
        end
    end
    return setmetatable(newSnake, self)
end

function Snake:setDir(dir)
    if self.dead or dir < UP or dir > RIGHT then
        return
    end
    local curDir = self.dir
    -- Snakes can't reverse
    if curDir == LEFT and dir == RIGHT or
        curDir == RIGHT and dir == LEFT or
        curDir == UP and dir == DOWN or
        curDir == DOWN and dir == UP then
        return
    end
    self.dir = dir
end

function Snake:grow()
    self.shouldGrow = true
end

function Snake:tick(grid)
    local head = self.head
    local dir = self.dir
    if dir == STOPPED then
        return
    end
    -- Move tail to current head
    if #self.body > 0 then
        local tail = {}
        if not self.shouldGrow then
           tail = table.remove(self.body)
        end
        self.shouldGrow = false
        tail.x = head.x
        tail.y = head.y
        table.insert(self.body, 1, tail)
    end
    -- Move head in direction
    if dir == UP then
        head.y = head.y - 1
    elseif dir == DOWN then
        head.y = head.y + 1
    elseif dir == LEFT then
        head.x = head.x - 1
    elseif dir == RIGHT then
        head.x = head.x + 1
    end
    -- Loop around if at edge of screen
    if head.x >= grid.width then
        self:handleWallHit(function () head.x = 0 end)
    elseif head.x < 0 then
        self:handleWallHit(function () head.x = grid.width end)
    elseif head.y >= grid.height then
        self:handleWallHit(function () head.y = 0 end)
    elseif head.y < 0 then
        self:handleWallHit(function () head.y = grid.height end)
    else
        self.hitWall = false
    end
end

function Snake:handleWallHit(noWallsCallback)
    if self.noWalls then
        -- If no walls, execute the callback, which loops the head
        -- to the opposite edge
        noWallsCallback()
    end
    self.hitWall = true
end

function Snake:renderBody(grid)
    for _, body in pairs(self.body) do
        grid:setChar(body.x, body.y, C.BodyChar)
    end
end

function Snake:renderHead(grid)
    local head = self.head
    print(vim.inspect(head))
    grid:setChar(head.x, head.y, C.HeadChar[self.dir])
end

function Snake:oops()
    self.dead = true
    self.dir = STOPPED
end

return Snake
