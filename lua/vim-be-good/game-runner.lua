local bind = require("vim-be-good.bind");
local GameUtils = require("vim-be-good.game-utils");
local RelativeRound = require("vim-be-good.relative");

local games = {
    relative = function(...) return RelativeRound:new(...) end
}

local runningId = 0

local GameRunner = {}

local function getGame(game, ...)
    return games[game](...)
end

-- games table, difficulty string
function GameRunner:new(selectedGames, diffculty, window)
    local config = {
        diffculty = diffculty,
        roundCount = GameUtils.getRoundCount(diffculty),
    }

    local rounds = {}
    for idx = 1, #selectedGames do
        table.insert(rounds, getGame(selectedGames[idx], diffculty, window))
    end

    local gameRunner = {
        currentRound = 1,
        rounds = rounds,
        config = config,
        window = window,
        results = {
            successes = 0,
            failures = 0,
            timings = {},
            games = {},
        },
    }

    self.__index = self
    local game = setmetatable(gameRunner, self)

    local function onChange()
        game:checkForWin()
    end

    game.onChange = onChange
    window.buffer:onChange(onChange)
    return game
end

function GameRunner:countdown(count, cb)
    local self = self
    ok, msg = pcall(function()
        if count > 0 then
            local str = string.format("Game Starts in %d", count)

            self.window.buffer:debugLine(str)
            self.window.buffer:render({})

            vim.defer_fn(function()
                self:countdown(count - 1, cb)
            end, 1000)
        else
            cb()
        end
    end)

    if not ok then
        print("Error: GameRunner#countdown", msg)
    end
end

function GameRunner:init()
    local self = self

    vim.schedule(function()
        self.window.buffer:setInstructions({})
        self.window.buffer:clear()
        self:countdown(3, function() self:run() end)
    end)
end

function GameRunner:checkForWin()
    if not self.round then
        return
    end

    if not self.running then
        return
    end

    if not self.round:checkForWin() then
        return
    end

    self:endRound(true)
end

function GameRunner:endRound(success)
    local self = self

    self.running = false
    if success then
        self.results.successes = self.results.successes + 1
    else
        self.results.failures = self.results.failures + 1
    end

    local endTime = GameUtils.getTime()
    table.insert(self.results.timings, endTime - self.startTime)
    table.insert(self.results.games, self.round:name())

    self.currentRound = self.currentRound + 1
    if self.config.roundCount == self.currentRound then
        self:endGame()
        return
    end

    vim.schedule_wrap(function() self:run() end)()
end

function GameRunner:endGame()
    print("I should of ended the game by now....", vim.inspect(self))
    self.window.buffer:removeListener(self.onChange)
end

function GameRunner:run()
    local idx = math.random(1, #self.rounds)
    self.round = self.rounds[idx]
    local roundConfig = self.round:getConfig()
    print("RoundName:", self.round:name())

    self.window.buffer:debugLine(string.format(
        "Round %d / %d", self.currentRound, self.config.roundCount))

    self.window.buffer:setInstructions(self.round.getInstructions())
    self.window.buffer:render(self.round:render())

    self.startTime = GameUtils.getTime()

    runningId = runningId + 1
    local currentId = runningId
    self.running = true

    local _self = self
    vim.defer_fn(function()
        print("Deferred?", currentId, runningId)
        if currentId < runningId then
            return
        end

        _self:endRound()
    end, roundConfig.roundTime)

end

return GameRunner

