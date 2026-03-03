import py_compile, glob, sys
for path in glob.glob('**/*.py', recursive=True):
    try:
        py_compile.compile(path, doraise=True)
        print(f'Compiled {path}')
    except Exception as e:
        print('Error', path, e, file=sys.stderr)
