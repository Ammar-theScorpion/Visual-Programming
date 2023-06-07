import random
import string

case_type = {
    'all':string.ascii_letters
}


def generate(constrains):

    test_type = case_type[constrains[0]]

    random_tests_n = random.randint(1, 5)
    random_tests = []
    for i in range(random_tests_n):
        sample = ''.join(random.choice(test_type) for _ in range(random.randint(1,20)))
        random_tests.append(sample)

 
    print(random_tests)
    return random_tests 
