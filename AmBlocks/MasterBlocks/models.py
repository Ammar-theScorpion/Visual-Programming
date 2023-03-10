from django.db import models
import sys

class Problem(models.Model):
    pname = models.CharField(max_length=20)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
        f"{self.pname} "
        f"({self.created_at:%Y-%m-%d %H:%M}): "
        f"{self.body[:30]}..."
        )
# if x>y {

# }
class Code(models.Model):
    textCode = models.TextField('text code', max_length=sys.maxsize)
    pass