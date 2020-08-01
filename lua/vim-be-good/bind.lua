local function bind(t, k, ...)
    print("AT ALL", ...)
    local args = {...} or {}
    return function(...) return t[k](t, unpack(args), ...) end
end

return bind
