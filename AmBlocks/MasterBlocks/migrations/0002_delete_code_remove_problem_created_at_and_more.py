# Generated by Django 4.1.7 on 2023-04-09 17:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MasterBlocks', '0001_initial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Code',
        ),
        migrations.RemoveField(
            model_name='problem',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='problem',
            name='id',
        ),
        migrations.AddField(
            model_name='problem',
            name='sequence',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='problem',
            name='valid_code',
            field=models.TextField(default=1),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='problem',
            name='pname',
            field=models.CharField(max_length=25, primary_key=True, serialize=False),
        ),
    ]
