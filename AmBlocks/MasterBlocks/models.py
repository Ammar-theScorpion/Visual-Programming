from django.db import models
import sys

class Problem(models.Model):
    tname = models.CharField(max_length=25, primary_key=True)
    body = models.TextField()
    parameters = models.PositiveIntegerField(default=0)
    valid_code = models.TextField()
    test_directives = models.TextField()
    sequence = models.IntegerField(default=0)
    #generate = models.TextField()


    def __str__(self):
        return (
        f"{self.tname} "
        f"{self.body[:30]}..."
        )

class TestCode(models.Model):
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    test = models.TextField()
    expected_output = models.TextField()


    def __str__(self):
        return (
        f"{self.problem.tname} "
        f"{self.test}..."
        f"{self.expected_output}..."
        )
