local bind = require("vim-be-good.bind");
local GameUtils = require("vim-be-good.game-utils");
local RelativeRound = require("vim-be-good.relative");

local games = {
    relative = function(...) return RelativeRound:new(...) end
}

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
        table.insert(rounds, getGame(selectedGames[idx], config))
    end

    local gameRunner = {
        currentRound = 1,
        rounds = rounds,
        config = config,
        window = window,
    }

    self.__index = self
    return setmetatable(gameRunner, self)
end

function GameRunner:countdown(count, cb)
    local self = self
    xpcall(function()
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
    end, debug.traceback)
end

function GameRunner:init()
    local self = self

    vim.schedule(function()
        self.window.buffer:setInstructions({})
        self.window.buffer:clear()
        self:countdown(3, function() self:start() end)
    end)
end

function GameRunner:start()
    local idx = math.random(1, #self.config.rounds)
    local round = self.config.rounds[idx]

    self.window.buffer:debugLine(string.format("Round %d / %d", self.currentRound, round))
    self.window.buffer:setInstructions(round.getInstructions())
    self.window.buffer:render(round.render())
end

return GameRunner

