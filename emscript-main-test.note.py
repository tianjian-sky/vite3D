# runner.py

# 获取所有测试

# suites:
# ['core0', 'core1', 'core2', 'core3', 'cores', 'corez', 'strict', 'wasm2js0', 'wasm2js1', 'wasm2js2', 'wasm2js3', 'wasm2jss', 'wasm2jsz', 'asan', 'lsan', 'ubsan', 'wasm64', 'wasm64_v8', 'other', 'browser', 'sanity', 'sockets', 'interactive', 'benchmark', 'wasm2ss', 'posixtest', 'posixtest_browser', 'minimal0', 'wasmfs', 'wasm64', 'wasm64l', 'bigint']

# tests:
# [
#     < module 'test_core' from '/Users/yutianjian/develop/emscripten-main/test/test_core.py' > ,
#     < module 'test_posixtest' from '/Users/yutianjian/develop/emscripten-main/test/test_posixtest.py' > ,
#     < module 'test_benchmark' from '/Users/yutianjian/develop/emscripten-main/test/test_benchmark.py' > ,
#     < module 'test_sanity' from '/Users/yutianjian/develop/emscripten-main/test/test_sanity.py' > ,
#     < module 'test_browser' from '/Users/yutianjian/develop/emscripten-main/test/test_browser.py' > ,
#     < module 'test_posixtest_browser' from '/Users/yutianjian/develop/emscripten-main/test/test_posixtest_browser.py' > ,
#     < module 'test_other' from '/Users/yutianjian/develop/emscripten-main/test/test_other.py' > ,
#     < module 'test_sockets' from '/Users/yutianjian/develop/emscripten-main/test/test_sockets.py' > ,
#     < module 'test_interactive' from '/Users/yutianjian/develop/emscripten-main/test/test_interactive.py' >
# ]


# python 装饰器
# https: // zhuanlan.zhihu.com/p/640193185

# 装饰器的使用方法很固定：
# 先定义一个装饰函数（帽子）（也可以用类、偏函数实现）
# 再定义你的业务函数、或者类（人）
# 最后把这顶帽子戴在这个人头上

# def my_decorator(func):
#     def wrapper():
#         print('wrapper of decorator')
#         func()
#     return wrapper
# def greet():
#     print('hello world')
# # 这里可以用下面的@语法糖实现，更优雅
# greet = my_decorator(greet)
# greet()

# def my_decorator(func):
#     def wrapper():
#         print('wrapper of decorator')
#         func()
#     return wrapper
# @my_decorator
# def greet():
#     print('hello world')
# greet()


# def my_decorator(func):
#     def wrapper(message):
#         print('wrapper of decorator')
#         func(message)
#     return wrapper


# @my_decorator
# def greet(message):
#     print(message)


# greet('hello world')
# 等价于：

# def my_decorator(func):
#     def wrapper(message):
#         print('wrapper of decorator')
#         func(message)

#     return wrapper


# def greet(message):
#     print(message)

# # @语法糖等价于下面这个
# greet = my_decorator(greet)
# greet('hello world')

# unittest --- 单元测试框架
# 源代码： Lib/unittest/__init__.py
# https://docs.python.org/zh-cn/3/library/unittest.html?ivk_sa=1024320u#


def get_and_import_modules():
    modules = []
    for filename in glob.glob(os.path.join(os.path.dirname(__file__), 'test*.py')):
        module_dir, module_file = os.path.split(filename)
        # module_name, module_ext = os.path.splitext(module_file)
    module_name, module_ext = os.path.splitext(module_file)
    __import__(module_name)
    modules.append(sys.modules[module_name])
    return modules


# https://docs.python.org/zh-cn/3/library/unittest.html?ivk_sa=1024320u
# 此方法是 TextTestRunner 的主要公共接口。 此方法接受一个 TestSuite 或 TestCase 实例。 通过调用 _makeResult() 创建 TestResult 来运行测试并将结果打印到标准输出。
testRunner.run(test)


def run_tests(options, suites):
    resultMessages = []
    num_failures = 0

    print('Test suites:')
    print([s[0] for s in suites])
    # Run the discovered tests

    if os.getenv('CI'):
        os.makedirs('out', exist_ok=True)
        # output fd must remain open until after testRunner.run() below
        output = open('out/test-results.xml', 'wb')
        import xmlrunner  # type: ignore
        testRunner = xmlrunner.XMLTestRunner(output=output, verbosity=2,
                                             failfast=options.failfast)
        print('Writing XML test output to ' + os.path.abspath(output.name))
    else:
        testRunner = unittest.TextTestRunner(
            verbosity=2, failfast=options.failfast)

    for mod_name, suite in suites:
        print('Running %s: (%s tests)' % (mod_name, suite.countTestCases()))
        res = testRunner.run(suite)
        msg = ('%s: %s run, %s errors, %s failures, %s skipped' %
               (mod_name, res.testsRun, len(res.errors), len(res.failures), len(res.skipped)))
        num_failures += len(res.errors) + len(res.failures) + \
            len(res.unexpectedSuccesses)
        resultMessages.append(msg)

    if len(resultMessages) > 1:
        print('====================')
        print()
        print('TEST SUMMARY')
        for msg in resultMessages:
            print('    ' + msg)

    return num_failures
