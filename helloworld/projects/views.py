from django.shortcuts import render
from . models import Project
# Create your views here.
def all_view(request):
    projects = Project.objects.all() # query set
    context = {
        'projects' : projects
    }
    return render(request, 'project_index.html', context)


def get_view(request, pk):
    obj = Project.objects.get(pk=pk)
    context = {
        'project' : obj
    }
    return render(request, 'project_detail.html', context)
