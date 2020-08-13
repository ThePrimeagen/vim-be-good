local bind = require("vim-be-good.bind");
local GameUtils = require("vim-be-good.game-utils");
local RelativeRound = require("vim-be-good.relative");
local log = require("vim-be-good.log");

local endStates = {
    menu = "Menu",
    replay = "Replay",
    quit = "Quit (or just ZZ like a real man)",
}

local states = {
    playing = 1,
    gameEnd = 2,
}

local games = {
    relative = function(difficulty, window)
        return RelativeRound:new(difficulty, window)
    end
}

local runningId = 0

local GameRunner = {}

local function getGame(game, difficulty, window)
    log.info("getGame", difficulty, window)
    return games[game](difficulty, window)
end

-- games table, difficulty string
function GameRunner:new(selectedGames, difficulty, window)
    log.info("New", difficulty)
    local config = {
        difficulty = difficulty,
        roundCount = GameUtils.getRoundCount(difficulty),
    }

    local rounds = {}
    for idx = 1, #selectedGames do
        table.insert(rounds, getGame(selectedGames[idx], difficulty, window))
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
        state = states.playing
    }

    self.__index = self
    local game = setmetatable(gameRunner, self)

    local function onChange()
        log.info("onChange", game.state, states.playing)
        if game.state == states.playing then
            game:checkForWin()
        else
            game:checkForNext()
        end
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
        log.info("Error: GameRunner#countdown", msg)
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

function GameRunner:checkForNext()
    log.info("GameRunner:checkForNext")

    local lines = self.window.buffer:getGameLines()
    local expectedLines, optionLine = self:renderEndGame()

    if #lines == #expectedLines then
        self.window.buffer:render(expectedLines)
        return
    end

    local idx = 0
    local found = false
    repeat
        idx = idx + 1
        found = lines[idx] ~= expectedLines[idx]
    until idx == #lines and found == false

    if found == false then
        self.window.buffer:render(expectedLines)
    end
    local item = expectedLines[idx]

    -- todo implement this correctly....
    if item == endStates.menu then
        self:close()
    elseif item == endStates.replay then
        self:close()
    elseif item == endStates.quit then
        self:close()
    else
        self.window.buffer:render(expectedLines)
    end
end

function GameRunner:checkForWin()
    log.info("GameRunner:checkForWin", self.round, self.running)
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
    log.info("endRound", self.currentRound, self.config.roundCount)
    if self.currentRound > 1 then
        self:endGame()
        return
    end

    vim.schedule_wrap(function() self:run() end)()
end

function GameRunner:close()

    -- CLOSE IT ALL!!!
    self.ended = true
    self.window.buffer:removeListener(self.onChange)


    -- TODO: we should probably have some sort of callback to the outside
    -- that way a menu or close option can be done easily where as a replay
    -- does not have to go through a bunch of nonsense
    self.window:close()
end

function GameRunner:renderEndGame()
    self.window.buffer:debugLine(string.format(
        "Round %d / %d", self.currentRound, self.config.roundCount))

    local lines = {}
    local sum = 0

    for idx = 1, #self.results.timings do
        sum = sum + self.results.timings[idx]
    end

    self.ended = true

    -- TODO: Make this a bit better especially with random.
    table.insert(lines, string.format("%d / %d completed successfully", self.results.successes, self.config.roundCount))
    table.insert(lines, string.format("Average %f.2", sum / self.config.roundCount))
    table.insert(lines, string.format("Game Type %s", self.results.games[0]))

    for idx = 1, 3 do
        table.insert(lines, "")
    end

    table.insert(lines, "Where do you want to go next? (Delete Line)")
    local optionLine = #lines + 1

    table.insert(lines, "Menu")
    table.insert(lines, "Replay")
    table.insert(lines, "Quit (or just ZZ like a real man)")

    return lines, optionLine
end

function GameRunner:endGame()
    local lines = self:renderEndGame()
    self.state = states.gameEnd
    self.window.buffer:setInstructions({})
    self.window.buffer:render(lines)
end

function GameRunner:run()
    local idx = math.random(1, #self.rounds)
    self.round = self.rounds[idx]
    local roundConfig = self.round:getConfig()
    log.info("RoundName:", self.round:name())

    self.window.buffer:debugLine(string.format(
        "Round %d / %d", self.currentRound, self.config.roundCount))

    self.window.buffer:setInstructions(self.round.getInstructions())
    local lines, cursorLine, cursorCol = self.round:render()
    self.window.buffer:render(lines)

    cursorLine = cursorLine or 0
    cursorCol = cursorCol or 0

    log.info("Setting current line to", cursorLine, cursorCol)
    if cursorLine > 0 then
        vim.api.nvim_win_set_cursor(self.winId, {cursorLine, cursorCol})
    end

    self.startTime = GameUtils.getTime()

    runningId = runningId + 1
    local currentId = runningId
    self.running = true

    log.info("defer_fn", roundConfig.roundTime)
    vim.defer_fn(function()
        if self.state == states.gameEnd then
            return
        end
        log.info("Deferred?", currentId, runningId)
        if currentId < runningId then
            return
        end

        self:endRound()
    end, roundConfig.roundTime)

end

return GameRunner

