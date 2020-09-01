local schedules = {}
local running = false

local function schedule(callback)
    table.insert(schedules, callback)
    run()
end

local function run()
    if running or #schedules == 0 then
        return
    end

    running = true
    vim.schedule(function()
        table.remove(1)()
        run()
    end)
end


return schedule
