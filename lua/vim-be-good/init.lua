local WindowHandler = require("vim-be-good.window");
local Menu = require("vim-be-good.menu");
local GameRunner = require("vim-be-good.game-runner");
local log = require("vim-be-good.log")

math.randomseed(os.time())

local windowHandler

local function onVimResize()
    if windowHandler then
        if not windowHandler:onResize() then
            windowHandler = nil
        end
    end
end

local function menu()
    log.info("------------------ STARTING THE GAME -----------------------------")
    endItAll = nil
    hasEverythingEnded = false

    local menu
    local gameRunner
    local rowPadding = vim.g["vim_be_good_window_padding_row"] or 6
    local colPadding = vim.g["vim_be_good_window_padding_col"] or 6
    windowHandler = WindowHandler:new(rowPadding, colPadding)
    windowHandler:show()

    endItAll = function()
        if hasEverythingEnded then
            return
        end

        log.info("endItAll", debug.traceback())
        hasEverythingEnded = true

        if windowHandler then
            windowHandler:close()
            windowHandler = nil
        end
        if menu ~= nil then
            menu:close()
            menu = nil
        end

        if gameRunner ~= nil then
            gameRunner:close()
            gameRunner = nil
        end
    end

    local onGameFinish
    local onMenuSelect

    function createMenu()
        menu = Menu:new(windowHandler, onMenuSelect)
        menu:render()
    end

    onGameFinish = function(gameString, difficulty, game, nextState)
        log.info("Ending it from the game baby!", nextState)

        vim.schedule(function()
            if nextState == "menu" then
                game:close()
                windowHandler.buffer:clear()
                vim.defer_fn(function()
                    createMenu()
                end, 0)
            elseif nextState == "replay" then
                game:close()
                onMenuSelect(gameString, difficulty)
            else
                endItAll()
            end
        end)

    end

    onMenuSelect = function(gameString, difficulty)
        menu:close()

        log.info("onResults", gameString, difficulty)
        local gameRunner = GameRunner:new({gameString}, difficulty, windowHandler, function(game, nextState)
            onGameFinish(gameString, difficulty, game, nextState)
        end)

        ok, msg = pcall(function() gameRunner:init() end, debug.traceback)
        if not ok then
            log.info("Error: Menu:new callback", msg)
        end
    end

    createMenu()
end

return {
    menu = menu,
    onVimResize = onVimResize
}


